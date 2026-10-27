import {
  LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG,
  LAMBDA_SDK_CLIENT_CHECKSUM_TAG,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { isLambdaResourceTags } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/is-lambda-resource-tags.util';

describe('isLambdaResourceTags', () => {
  it.each([
    {},
    { Environment: 'production', Owner: '' },
    { Équipe: 'Opérations' },
    { ['k'.repeat(128)]: 'v'.repeat(256) },
    Object.fromEntries(
      Array.from({ length: 48 }, (_, index) => [`key-${index}`, 'value']),
    ),
  ])('accepts valid deployment tags %p', (tags) => {
    expect(isLambdaResourceTags(tags)).toBe(true);
  });

  it.each<{ tags: unknown }>([
    { tags: null },
    { tags: [] },
    { tags: 'not an object' },
    { tags: { Owner: 42 } },
    { tags: { Owner: true } },
    { tags: { Owner: null } },
    { tags: { Owner: ['team'] } },
    { tags: { Owner: { name: 'team' } } },
    { tags: { '': 'value' } },
    { tags: { ['k'.repeat(129)]: 'value' } },
    { tags: { Owner: 'v'.repeat(257) } },
    { tags: { 'aws:owner': 'team' } },
    { tags: { 'AWS:owner': 'team' } },
    { tags: { [LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG]: 'checksum' } },
    { tags: { [LAMBDA_SDK_CLIENT_CHECKSUM_TAG]: 'checksum' } },
    { tags: { 'bad?key': 'value' } },
    { tags: { Owner: 'bad?value' } },
    {
      tags: Object.fromEntries(
        Array.from({ length: 49 }, (_, index) => [`key-${index}`, 'value']),
      ),
    },
  ])('rejects invalid deployment tags $tags', ({ tags }) => {
    expect(isLambdaResourceTags(tags)).toBe(false);
  });
});
