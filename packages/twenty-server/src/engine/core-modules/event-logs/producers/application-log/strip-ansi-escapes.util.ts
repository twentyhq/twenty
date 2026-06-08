const ANSI_CSI_REGEX = /\u001B\[[0-?]*[ -/]*[@-~]/g;

const ANSI_OSC_REGEX = /\u001B\][^\u0007\u001B]*(?:\u0007|\u001B\\)/g;

export const stripAnsiEscapes = (value: string): string =>
  value.replace(ANSI_CSI_REGEX, '').replace(ANSI_OSC_REGEX, '');
