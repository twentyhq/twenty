import { uploadAppTarballQueryFactory } from 'test/integration/metadata/suites/application/utils/upload-app-tarball-query-factory.util';
import { makeMetadataAPIRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

type UploadAppTarballResult = {
  id: string;
  universalIdentifier: string;
  name: string;
};

export const uploadAppTarball = async ({
  tarballBuffer,
  universalIdentifier,
  expectToFail = false,
  token,
}: {
  tarballBuffer: Buffer;
  universalIdentifier?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  uploadAppTarball: UploadAppTarballResult;
}> => {
  const graphqlOperation = uploadAppTarballQueryFactory({
    universalIdentifier,
  });

  const response = await makeMetadataAPIRequestWithFileUpload(
    graphqlOperation,
    {
      field: 'file',
      buffer: tarballBuffer,
      filename: 'app.tar.gz',
      contentType: 'application/gzip',
    },
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Upload app tarball should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Upload app tarball has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
