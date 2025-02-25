export interface MigrationCommandInterface<
  Options extends Record<string, unknown> = Record<string, unknown>,
> {
  runMigrationCommand(passedParams: string[], options: Options): Promise<void>;
}
