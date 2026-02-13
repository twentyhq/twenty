import chalk from 'chalk';

const SEPARATOR_WIDTH = 60;

let _verbose = false;

export const setVerbose = (value: boolean): void => {
  _verbose = value;
};

export const isVerbose = (): boolean => _verbose;

export const logSeparator = (): void => {
  if (!_verbose) return;
  console.log('');
  console.log(chalk.gray('─'.repeat(SEPARATOR_WIDTH)));
  console.log('');
};

export const logTitle = (text: string): void => {
  if (!_verbose) return;
  console.log('');
  console.log(chalk.bold.white(`  ${text}`));
  console.log('');
  console.log(chalk.gray('─'.repeat(SEPARATOR_WIDTH)));
  console.log('');
};

export const logSectionHeader = (text: string): void => {
  if (!_verbose) return;
  console.log(chalk.bold.white(`  ${text}`));
  console.log('');
};

export const logCategory = (name: string): void => {
  if (!_verbose) return;
  console.log(chalk.green('  ▸ ') + chalk.green.bold(name));
};

export const logSubItem = (label: string, value: string): void => {
  if (!_verbose) return;
  console.log(
    chalk.gray('    ') +
      chalk.green(label) +
      chalk.gray(' -> ') +
      chalk.white(value),
  );
};

const pluralize = (count: number, singular: string, plural: string): string =>
  count === 1 ? singular : plural;

export const logCount = (
  label: string,
  count: number,
  singularUnit: string,
  pluralUnit?: string,
): void => {
  if (!_verbose) return;
  const unit = pluralize(count, singularUnit, pluralUnit ?? singularUnit + 's');
  console.log(
    chalk.green(`  ${label}  `) +
      chalk.white.bold(`${count}`) +
      chalk.gray(` ${unit}`),
  );
};

export const logDetail = (text: string): void => {
  if (!_verbose) return;
  console.log(chalk.gray(`    ${text}`));
};

export const logDimText = (text: string): void => {
  if (!_verbose) return;
  console.log(chalk.gray(text));
};

export const logFileWritten = (filePath: string): void => {
  if (!_verbose) return;
  console.log(chalk.green('  ✓ ') + chalk.gray(filePath));
};

export const logGroupLabel = (text: string): void => {
  if (!_verbose) return;
  console.log(chalk.green(`  ${text}`));
};

export const logSuccess = (message: string, detail?: string): void => {
  if (!_verbose) return;
  const detailSuffix = detail ? chalk.gray(` ${detail}`) : '';

  console.log(chalk.green(`  ✔ `) + chalk.green.bold(message) + detailSuffix);
};

export const logError = (message: string, error?: unknown): void => {
  console.error(chalk.red.bold(`  ✖ ${message}`), error ?? '');
};

export const logWarning = (message: string): void => {
  if (!_verbose) return;
  console.warn(chalk.yellow(`  ${message}`));
};

export const logEmpty = (): void => {
  if (!_verbose) return;
  console.log('');
};

export const logLine = (text: string): void => {
  if (!_verbose) return;
  console.log(text);
};

export const logCountInline = (
  count: number,
  singularUnit: string,
  pluralUnit?: string,
  prefix?: string,
): string => {
  const unit = pluralize(count, singularUnit, pluralUnit ?? singularUnit + 's');
  const prefixText = prefix ? chalk.gray(`${prefix} `) : '';

  return prefixText + chalk.white.bold(`${count}`) + chalk.gray(` ${unit}`);
};

export const formatProps = (count: number): string =>
  chalk.green(`${count} ${pluralize(count, 'prop', 'props')}`);

export const formatEvents = (count: number, names: string[]): string =>
  chalk.yellow(`${count} ${pluralize(count, 'event', 'events')}`) +
  chalk.gray(` [${names.join(', ')}]`);

export const formatSlots = (count: number, names: string[]): string =>
  chalk.magenta(`${count} ${pluralize(count, 'slot', 'slots')}`) +
  chalk.gray(` [${names.join(', ')}]`);
