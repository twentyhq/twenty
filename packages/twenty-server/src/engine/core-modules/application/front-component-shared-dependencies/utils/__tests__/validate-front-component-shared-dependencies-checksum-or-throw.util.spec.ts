import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { validateFrontComponentSharedDependenciesChecksumOrThrow } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/validate-front-component-shared-dependencies-checksum-or-throw.util';

const SOURCE = "export const label = 'Visible records: ';";
const CHECKSUM =
  '9ecb73aa1c9807936b7167777d5178f0c74386e4b0a3f66625be84dc13004f6d';

it('accepts the SHA-256 checksum used by browser bundles', () => {
  expect(() =>
    validateFrontComponentSharedDependenciesChecksumOrThrow({
      source: SOURCE,
      checksum: CHECKSUM,
    }),
  ).not.toThrow();
});

it('rejects changed bytes before storing an immutable bundle', () => {
  expect(() =>
    validateFrontComponentSharedDependenciesChecksumOrThrow({
      source: SOURCE + ' ',
      checksum: CHECKSUM,
    }),
  ).toThrow(
    new ApplicationException(
      'Shared dependencies checksum mismatch',
      ApplicationExceptionCode.INVALID_INPUT,
    ),
  );
});
