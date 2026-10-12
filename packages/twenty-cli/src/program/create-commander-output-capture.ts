import { type OutputConfiguration } from 'commander';

export const createCommanderOutputCapture = () => {
  const captured = { standardOutput: '', standardError: '' };

  const configuration: OutputConfiguration = {
    writeOut: (text) => {
      captured.standardOutput += text;
    },
    writeErr: (text) => {
      captured.standardError += text;
    },
    outputError: (text) => {
      captured.standardError += text;
    },
  };

  return { captured, configuration };
};
