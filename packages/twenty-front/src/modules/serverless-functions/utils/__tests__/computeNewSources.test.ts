import { computeNewSources } from '@/serverless-functions/utils/computeNewSources';

describe('computeNewSources', () => {
  it('should compute new code input root 0', () => {
    const previousCodeInput = {
      'index.ts': 'export const toto = () => {}',
    };

    const filePath = 'index.ts';

    const value = 'export const totoUpdated = () => {}';

    const expectedResult = {
      'index.ts': 'export const totoUpdated = () => {}',
    };

    expect(
      computeNewSources({ previousCode: previousCodeInput, filePath, value }),
    ).toEqual(expectedResult);
  });

  it('should compute new code input root 0 file changed', () => {
    const previousCodeInput = {
      '.env': 'ENV=env',
      'index.ts': 'export const toto = () => {}',
    };

    const filePath = '.env';

    const value = 'ENV=env\nENV2=env2';

    const expectedResult = {
      '.env': 'ENV=env\nENV2=env2',
      'index.ts': 'export const toto = () => {}',
    };

    expect(
      computeNewSources({ previousCode: previousCodeInput, filePath, value }),
    ).toEqual(expectedResult);
  });

  it('should compute new code input root 0 with multiple files', () => {
    const previousCodeInput = {
      'index.ts': 'export const toto = () => {}',
      '.env': 'ENV',
    };

    const filePath = 'index.ts';

    const value = 'export const totoUpdated = () => {}';

    const expectedResult = {
      'index.ts': 'export const totoUpdated = () => {}',
      '.env': 'ENV',
    };

    expect(
      computeNewSources({ previousCode: previousCodeInput, filePath, value }),
    ).toEqual(expectedResult);
  });

  it('should compute new code input root 1', () => {
    const previousCodeInput = {
      src: { 'index.ts': 'export const toto = () => {}' },
    };

    const filePath = 'src/index.ts';

    const value = 'export const totoUpdated = () => {}';

    const expectedResult = {
      src: { 'index.ts': 'export const totoUpdated = () => {}' },
    };

    expect(
      computeNewSources({ previousCode: previousCodeInput, filePath, value }),
    ).toEqual(expectedResult);
  });

  it('should compute new code input root 1 with multiple files', () => {
    const previousCodeInput = {
      src: {
        'index.ts': 'export const toto = () => {}',
        'index2.ts': 'export const toto2 = () => {}',
      },
    };

    const filePath = 'src/index.ts';

    const value = 'export const totoUpdated = () => {}';

    const expectedResult = {
      src: {
        'index.ts': 'export const totoUpdated = () => {}',
        'index2.ts': 'export const toto2 = () => {}',
      },
    };

    expect(
      computeNewSources({ previousCode: previousCodeInput, filePath, value }),
    ).toEqual(expectedResult);
  });

  it('should compute new code input root 1 with added files', () => {
    const previousCodeInput = {
      src: {
        'index.ts': 'export const toto = () => {}',
      },
    };

    const filePath = 'src/index2.ts';

    const value = 'export const toto2 = () => {}';

    const expectedResult = {
      src: {
        'index.ts': 'export const toto = () => {}',
        'index2.ts': 'export const toto2 = () => {}',
      },
    };

    expect(
      computeNewSources({ previousCode: previousCodeInput, filePath, value }),
    ).toEqual(expectedResult);
  });

  it('should compute new code input multiple roots', () => {
    const previousCodeInput = {
      '.env': 'ENV=env',
      src: { 'index.ts': 'export const toto = () => {}' },
    };

    const filePath = 'src/index.ts';

    const value = 'export const totoUpdated = () => {}';

    const expectedResult = {
      src: { 'index.ts': 'export const totoUpdated = () => {}' },
      '.env': 'ENV=env',
    };

    expect(
      computeNewSources({ previousCode: previousCodeInput, filePath, value }),
    ).toEqual(expectedResult);
  });
});
