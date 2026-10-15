export type AppFunctionSelector =
  | { kind: 'name' | 'universalIdentifier'; value: string }
  | {
      kind: 'hook';
      value:
        | 'postInstallLogicFunction'
        | 'preInstallLogicFunction'
        | 'uninstallLogicFunction';
    };
