import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';

export const getApplicationVariableValue = async (
  key: string,
): Promise<string | undefined> => {
  try {
    const metadataClient = new MetadataApiClient();
    const result = await metadataClient.query({
      findOneApplication: {
        __args: getApplicationQueryArgs(),
        applicationVariables: {
          key: true,
          value: true,
        },
      },
    });
    const variable = result.findOneApplication?.applicationVariables?.find(
      (applicationVariable) => applicationVariable.key === key,
    );

    if (typeof variable?.value === 'string') {
      return variable.value;
    }
  } catch (error) {
    console.warn(
      `[recall-recording-bot] failed to read ${key} from ApplicationVariable; falling back to env var: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const envValue = process.env[key];

  return typeof envValue === 'string' ? envValue : undefined;
};

const getApplicationQueryArgs = ():
  | { id: string }
  | { universalIdentifier: string } => {
  const applicationId = process.env.APPLICATION_ID;

  if (typeof applicationId === 'string' && applicationId.trim() !== '') {
    return { id: applicationId };
  }

  return { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER };
};
