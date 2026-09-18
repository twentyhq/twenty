import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { GranolaFolderPicker } from 'src/front-components/components/GranolaFolderPicker';
import { GranolaFolderPolicyRadioCard } from 'src/front-components/components/GranolaFolderPolicyRadioCard';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';

type GranolaFolderSectionProps = {
  registration: GranolaConnectionStatus['registration'];
};

export const GranolaFolderSection = ({
  registration,
}: GranolaFolderSectionProps) => (
  <Section>
    <H2Title
      title={t('Folders')}
      description={t(
        'Choose which Granola folders feed live sync and history imports.',
      )}
    />
    <StyledSettingsSectionStack>
      {isDefined(registration) ? (
        <GranolaFolderPicker
          selectedFolderIds={registration.folderIds}
          pendingFolderIds={registration.pendingFolderIds}
        />
      ) : (
        <GranolaFolderPolicyRadioCard policy={undefined} />
      )}
    </StyledSettingsSectionStack>
  </Section>
);
