import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { RESPONSE_BYTE_LIMIT } from '@/transport/constants/response-byte-limit.constant';
import { RESULT_ITEM_LIMIT } from '@/transport/constants/result-item-limit.constant';

export const assertDataResultLimit = ({
  recordCount,
  bytes,
}: {
  recordCount: number;
  bytes: number;
}) => {
  if (recordCount > RESULT_ITEM_LIMIT || bytes > RESPONSE_BYTE_LIMIT) {
    throw new CliError({
      code: 'RESULT_LIMIT_EXCEEDED',
      exitCode: EXIT_CODE.USAGE,
      message: 'Records exceed the 10,000-item or 16 MiB result limit.',
      hint: 'Use data list <object> --all --format ndjson to stream records, or request fewer records.',
      details: { recordCount, bytes },
    });
  }
};
