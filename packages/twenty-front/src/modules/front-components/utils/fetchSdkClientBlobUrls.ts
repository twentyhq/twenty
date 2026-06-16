import { type SdkClientBlobUrls } from '@/front-components/states/sdkClientFamilyState';
import { getSdkClientUrls } from '@/front-components/utils/getSdkClientUrls';
import { isNonEmptyString } from 'twenty-shared/utils';

const SDK_IMPORT_SPECIFIER_REGEX =
  /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

const isRelativeImportSpecifier = (specifier: string): boolean =>
  specifier.startsWith('./') || specifier.startsWith('../');

const fetchSdkModuleSource = async (
  url: string,
  token: string,
): Promise<string> => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch SDK module from ${url}: ${response.status}`,
    );
  }

  return response.text();
};

const extractRelativeImportSpecifiers = (source: string): string[] => {
  const matches = source.matchAll(SDK_IMPORT_SPECIFIER_REGEX);
  const relativeImportSpecifiers = new Set<string>();

  for (const match of matches) {
    const specifier = match[1] ?? match[2];

    if (!isNonEmptyString(specifier) || !isRelativeImportSpecifier(specifier)) {
      continue;
    }

    relativeImportSpecifiers.add(specifier);
  }

  return [...relativeImportSpecifiers];
};

const rewriteRelativeImportSpecifiers = (
  source: string,
  relativeSpecifierToBlobUrlMap: Map<string, string>,
): string => {
  let rewrittenSource = source;

  for (const [relativeSpecifier, blobUrl] of relativeSpecifierToBlobUrlMap) {
    rewrittenSource = rewrittenSource
      .split(`"${relativeSpecifier}"`)
      .join(`"${blobUrl}"`)
      .split(`'${relativeSpecifier}'`)
      .join(`'${blobUrl}'`);
  }

  return rewrittenSource;
};

const createSdkModuleBlobUrl = async ({
  moduleUrl,
  token,
  createdBlobUrls,
  blobUrlByModuleUrl,
}: {
  moduleUrl: string;
  token: string;
  createdBlobUrls: string[];
  blobUrlByModuleUrl: Map<string, Promise<string>>;
}): Promise<string> => {
  const existingBlobUrlPromise = blobUrlByModuleUrl.get(moduleUrl);

  if (existingBlobUrlPromise) {
    return existingBlobUrlPromise;
  }

  const blobUrlPromise = (async () => {
    const source = await fetchSdkModuleSource(moduleUrl, token);
    const relativeImportSpecifiers = extractRelativeImportSpecifiers(source);

    const relativeSpecifierToBlobUrlEntries = await Promise.all(
      relativeImportSpecifiers.map(async (relativeImportSpecifier) => {
        const importedModuleUrl = new URL(relativeImportSpecifier, moduleUrl)
          .href;

        const importedModuleBlobUrl = await createSdkModuleBlobUrl({
          moduleUrl: importedModuleUrl,
          token,
          createdBlobUrls,
          blobUrlByModuleUrl,
        });

        return [relativeImportSpecifier, importedModuleBlobUrl] as const;
      }),
    );

    const rewrittenSource = rewriteRelativeImportSpecifiers(
      source,
      new Map(relativeSpecifierToBlobUrlEntries),
    );

    const blobUrl = URL.createObjectURL(
      new Blob([rewrittenSource], { type: 'application/javascript' }),
    );

    createdBlobUrls.push(blobUrl);

    return blobUrl;
  })();

  blobUrlByModuleUrl.set(moduleUrl, blobUrlPromise);

  return blobUrlPromise;
};

export const fetchSdkClientBlobUrls = async (
  applicationId: string,
  accessToken: string,
): Promise<SdkClientBlobUrls> => {
  const urls = getSdkClientUrls(applicationId);
  const createdBlobUrls: string[] = [];
  const blobUrlByModuleUrl = new Map<string, Promise<string>>();

  try {
    const [core, metadata] = await Promise.all([
      createSdkModuleBlobUrl({
        moduleUrl: urls.core,
        token: accessToken,
        createdBlobUrls,
        blobUrlByModuleUrl,
      }),
      createSdkModuleBlobUrl({
        moduleUrl: urls.metadata,
        token: accessToken,
        createdBlobUrls,
        blobUrlByModuleUrl,
      }),
    ]);

    return { core, metadata };
  } catch (error) {
    for (const blobUrl of createdBlobUrls) {
      URL.revokeObjectURL(blobUrl);
    }

    throw error;
  }
};
