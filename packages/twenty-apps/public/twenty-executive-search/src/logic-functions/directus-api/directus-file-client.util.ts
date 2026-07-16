import { isUndefined } from '@sniptt/guards';

import { directusApiRequest } from 'src/logic-functions/directus-api/directus-api-request.util';
import { type DirectusApiConfig } from 'src/logic-functions/directus-api/get-directus-api-config.util';

/**
 * Directus Files API client.
 *
 * GET  /files/{id}   — retrieve file metadata
 * POST /files        — upload a file (multipart)
 */

export type DirectusFile = {
  id: string;
  title: string | null;
  filename_download: string;
  type: string | null;
  filesize: number | null;
  uploaded_on: string;
  modified_on: string;
};

export const getDirectusFile = ({
  config,
  id,
}: {
  config: DirectusApiConfig;
  id: string;
}) =>
  directusApiRequest<DirectusFile>({
    config,
    path: `/files/${id}`,
    method: 'GET',
    allowNotFound: true,
  });

export type DirectusFileUploadArgs = {
  config: DirectusApiConfig;
  fileName: string;
  fileBody: Blob | Buffer;
  mimeType?: string;
  title?: string;
};

export const uploadDirectusFile = async ({
  config,
  fileName,
  fileBody,
  mimeType,
  title,
}: DirectusFileUploadArgs) => {
  const formData = new FormData();

  formData.append('file', new Blob([fileBody], { type: mimeType }), fileName);

  if (!isUndefined(title)) {
    formData.append('title', title);
  }

  let response: Response;

  try {
    response = await fetch(`${config.url}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        // Do not set Content-Type; the browser sets multipart/form-data with boundary.
      },
      body: formData,
    });
  } catch (error) {
    return {
      ok: false as const,
      status: null,
      errorMessage: `Directus file upload failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  if (!response.ok) {
    const fallback = `Directus API responded with HTTP ${response.status}`;

    let errorMessage: string;

    try {
      const body = (await response.json()) as unknown;

      errorMessage = `${fallback}: ${JSON.stringify(body)}`;
    } catch {
      errorMessage = fallback;
    }

    return {
      ok: false as const,
      status: response.status,
      errorMessage,
    };
  }

  try {
    return {
      ok: true as const,
      status: response.status,
      data: (await response.json()) as { id: string; title: string | null },
    };
  } catch (error) {
    return {
      ok: false as const,
      status: response.status,
      errorMessage: `Directus API returned a non-JSON response: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};
