import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import {
  type DeveloperLinks,
  SettingsApplicationAboutSidebar,
} from '@/settings/applications/components/SettingsApplicationAboutSidebar';
import { SettingsApplicationScreenshotGallery } from '@/settings/applications/components/SettingsApplicationScreenshotGallery';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';

type SettingsApplicationDetailAboutTabProps = {
  applicationId?: string | null;
  logoUrl?: string | null;
  displayName: string;
  description?: string;
  aboutDescription?: string;
  pricingDescription?: string;
  screenshots?: string[];
  author?: string;
  version?: string;
  installCount?: number;
  category?: string;
  developerLinks?: DeveloperLinks;
  onShare?: () => void;
};

const SIDEBAR_COLUMN_MIN_WIDTH_PX = 160;
const MAIN_COLUMN_WIDTH_PX = 472;
const COLUMN_GAP_PX = 16;
const TWO_COLUMN_LAYOUT_MIN_WIDTH_PX =
  SIDEBAR_COLUMN_MIN_WIDTH_PX + COLUMN_GAP_PX + MAIN_COLUMN_WIDTH_PX;

const StyledContentContainer = styled.div`
  align-items: flex-start;
  container-name: application-about;
  container-type: inline-size;
  display: flex;
  flex-wrap: wrap;
  gap: ${COLUMN_GAP_PX}px;
  width: 100%;
`;

// The sidebar only sticks while both columns fit side by side: once they
// stack, a sticky sidebar would cover the description below it. It sticks
// at the page's top padding so it does not jump when scrolling starts.
const StyledSidebarColumn = styled.div`
  flex: 1 1 0;
  min-width: ${SIDEBAR_COLUMN_MIN_WIDTH_PX}px;

  @container application-about (min-width: ${TWO_COLUMN_LAYOUT_MIN_WIDTH_PX}px) {
    position: sticky;
    top: var(--settings-page-container-padding-top, 0);
  }
`;

const StyledMainColumn = styled.div`
  display: flex;
  flex: 0 0 ${MAIN_COLUMN_WIDTH_PX}px;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-width: 100%;
  min-width: 0;
  padding-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledMarkdownContent = styled.div`
  .markdown-section {
    color: ${themeCssVariables.font.color.secondary};
    font-size: ${themeCssVariables.font.size.md};
    line-height: 1.4;
    margin: 0;
  }

  .markdown-section h1,
  .markdown-section h2 {
    color: ${themeCssVariables.font.color.primary};
    font-size: ${themeCssVariables.font.size.xl};
    line-height: 1.2;
    margin-bottom: ${themeCssVariables.spacing[2]};
    margin-top: ${themeCssVariables.spacing[6]};
  }

  .markdown-section h3,
  .markdown-section h4 {
    color: ${themeCssVariables.font.color.primary};
    font-size: ${themeCssVariables.font.size.lg};
    font-weight: ${themeCssVariables.font.weight.semiBold};
    line-height: 1.2;
    margin-bottom: ${themeCssVariables.spacing[2]};
    margin-top: ${themeCssVariables.spacing[5]};
  }

  .markdown-section > :first-child {
    margin-top: 0;
  }

  .markdown-section ul,
  .markdown-section ol {
    margin-bottom: ${themeCssVariables.spacing[3]};
    margin-top: ${themeCssVariables.spacing[2]};
    padding-left: ${themeCssVariables.spacing[5]};
  }

  .markdown-section li {
    margin-bottom: ${themeCssVariables.spacing[1]} !important;
    padding-bottom: 0 !important;
    padding-top: 0 !important;
  }

  .markdown-section .markdown-code-outer-container {
    margin: ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[4]};
  }

  .markdown-section .markdown-block-code {
    padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  }

  .markdown-section .markdown-block-code code {
    color: ${themeCssVariables.font.color.primary};
    display: block;
    font-family: ${themeCssVariables.code.font.family}, monospace;
    font-size: ${themeCssVariables.font.size.sm};
    line-height: 1.6;
  }
`;

export const SettingsApplicationDetailAboutTab = ({
  applicationId,
  logoUrl,
  displayName,
  description,
  aboutDescription,
  pricingDescription,
  screenshots,
  author,
  version,
  installCount,
  category,
  developerLinks,
  onShare,
}: SettingsApplicationDetailAboutTabProps) => {
  const hasScreenshots = isDefined(screenshots) && screenshots.length > 0;

  const descriptionSummary = getApplicationDescriptionSummary(description);

  // The sidebar shows the first paragraph of the description, so the content
  // column only renders the description itself when it holds more than that.
  const getMarkdownText = () => {
    if (isNonEmptyString(aboutDescription)) {
      return aboutDescription;
    }

    if (isNonEmptyString(description)) {
      return description.trim() === descriptionSummary
        ? undefined
        : description;
    }

    return t`No description available for this application`;
  };

  const markdownText = getMarkdownText();

  return (
    <StyledContentContainer>
      <StyledSidebarColumn>
        <SettingsApplicationAboutSidebar
          applicationId={applicationId}
          logoUrl={logoUrl}
          displayName={displayName}
          description={descriptionSummary}
          onShare={onShare}
          author={author}
          version={version}
          installCount={installCount}
          category={category}
          pricingDescription={pricingDescription}
          developerLinks={developerLinks}
        />
      </StyledSidebarColumn>

      <StyledMainColumn>
        {hasScreenshots && (
          <SettingsApplicationScreenshotGallery
            screenshots={screenshots}
            displayName={displayName}
          />
        )}
        {isDefined(markdownText) && (
          <StyledMarkdownContent>
            <LazyMarkdownRenderer text={markdownText} noImage />
          </StyledMarkdownContent>
        )}
      </StyledMainColumn>
    </StyledContentContainer>
  );
};
