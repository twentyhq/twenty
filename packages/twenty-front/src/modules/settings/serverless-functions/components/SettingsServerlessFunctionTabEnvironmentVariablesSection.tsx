import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { SettingsPath } from 'twenty-shared/types';
import { LinkChip } from 'twenty-ui/components';
import { getSettingsPath } from 'twenty-shared/utils';
import { useParams } from 'react-router-dom';

export const SettingsServerlessFunctionTabEnvironmentVariablesSection = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();
  return (
    <Section>
      <H2Title
        title="Environment Variables"
        description="Accessible in your function via process.env.KEY"
      />
      Environment variables are defined at application level for all functions.
      Please check{' '}
      <LinkChip
        label={'application detail page'}
        to={getSettingsPath(
          SettingsPath.ApplicationDetail,
          {
            applicationId,
          },
          undefined,
          'settings',
        )}
      />
      .
    </Section>
  );
};
