type ClientWrapperOptions = {
  apiClientName: string;
  defaultUrl: string;
  includeUploadFile: boolean;
};

const STRIPPED_TYPES_START = '// __STRIPPED_DURING_INJECTION_START__';
const STRIPPED_TYPES_END = '// __STRIPPED_DURING_INJECTION_END__';
const UPLOAD_FILE_START = '// __UPLOAD_FILE_START__';
const UPLOAD_FILE_END = '// __UPLOAD_FILE_END__';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildClientWrapperSource = (
  templateSource: string,
  options: ClientWrapperOptions,
): string => {
  let source = templateSource;

  source = source.replace(
    new RegExp(
      `${escapeRegExp(STRIPPED_TYPES_START)}[\\s\\S]*?${escapeRegExp(STRIPPED_TYPES_END)}\\n?`,
    ),
    '',
  );

  source = source.replace("'__TWENTY_DEFAULT_URL__'", options.defaultUrl);

  source = source.replace(/TwentyGeneratedClient/g, options.apiClientName);

  if (!options.includeUploadFile) {
    source = source.replace(
      new RegExp(
        `\\s*${escapeRegExp(UPLOAD_FILE_START)}[\\s\\S]*?${escapeRegExp(UPLOAD_FILE_END)}\\n?`,
      ),
      '\n',
    );
  } else {
    source = source.replace(
      new RegExp(`\\s*${escapeRegExp(UPLOAD_FILE_START)}\\n`),
      '\n',
    );
    source = source.replace(
      new RegExp(`\\s*${escapeRegExp(UPLOAD_FILE_END)}\\n`),
      '\n',
    );
  }

  return `\n// ${options.apiClientName} (auto-injected by twenty-client-sdk)\n${source}`;
};
