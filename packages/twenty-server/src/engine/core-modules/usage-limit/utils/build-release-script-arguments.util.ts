import { buildConsumeScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-consume-script-arguments.util';

export const buildReleaseScriptArguments = (amounts: number[]): string[] => {
  const [, warmValues, warmTtls] = buildConsumeScriptArguments({
    entries: amounts.map((amount) => ({ amount, warm: null })),
  });

  return [
    JSON.stringify(amounts.map((amount) => -amount)),
    warmValues,
    warmTtls,
  ];
};
