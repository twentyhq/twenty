import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type Application } from '~/generated-metadata/graphql';
import {
  SettingsApplicationAboutSidebar,
  type ContentEntry,
  type DeveloperLinks,
} from '~/pages/settings/applications/components/SettingsApplicationAboutSidebar';
import { SettingsApplicationScreenshotGallery } from '~/pages/settings/applications/components/SettingsApplicationScreenshotGallery';
import { SettingsApplicationUninstallSection } from '~/pages/settings/applications/components/SettingsApplicationUninstallSection';
import { SettingsApplicationVersionContainer } from '~/pages/settings/applications/components/SettingsApplicationVersionContainer';

type SettingsApplicationDetailAboutTabProps = {
  displayName: string;
  description?: string;
  aboutDescription?: string;
  screenshots?: string[];
  author?: string;
  category?: string;
  contentEntries?: ContentEntry[];
  currentVersion?: string;
  latestAvailableVersion?: string;
  developerLinks?: DeveloperLinks;
  actionButton?: ReactNode;
  isInstalled: boolean;
  application?: Omit<Application, 'objects' | 'frontComponents'> & {
    objects: { id: string }[];
  };
};

const StyledContentContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMainContent = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StyledSectionTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

export const SettingsApplicationDetailAboutTab = ({
  displayName,
  description,
  aboutDescription,
  screenshots,
  author,
  category,
  contentEntries,
  currentVersion,
  latestAvailableVersion,
  developerLinks,
  actionButton,
  isInstalled,
  application,
}: SettingsApplicationDetailAboutTabProps) => {
  const hasScreenshots = isDefined(screenshots) && screenshots.length > 0;

  const markdownText =
    aboutDescription ??
    description ??
    t`No description available for this application`;

  return (
    <>
      {hasScreenshots && (
        <SettingsApplicationScreenshotGallery
          screenshots={screenshots}
          displayName={displayName}
        />
      )}

      <StyledContentContainer>
        <StyledMainContent>
          <Section>
            <StyledSectionTitle>{t`About`}</StyledSectionTitle>
            <LazyMarkdownRenderer text={markdownText} />
          </Section>
        </StyledMainContent>

        <SettingsApplicationAboutSidebar
          actionButton={actionButton}
          author={author}
          category={category}
          contentEntries={contentEntries}
          currentVersion={currentVersion}
          latestAvailableVersion={latestAvailableVersion}
          developerLinks={developerLinks}
        />
      </StyledContentContainer>

      {isInstalled && isDefined(application) && (
        <>
          <Section>
            <SettingsApplicationVersionContainer
              application={application}
              latestAvailableVersion={
                application.applicationRegistration?.latestAvailableVersion ??
                null
              }
              appRegistrationId={application.applicationRegistrationId}
            />
          </Section>
          <SettingsApplicationUninstallSection
            universalIdentifier={application.universalIdentifier}
            canBeUninstalled={application.canBeUninstalled}
          />
        </>
      )}
    </>
  );
};
