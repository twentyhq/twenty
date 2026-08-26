import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { Callout } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { SlackUserLinkForm } from 'src/front-components/components/SlackUserLinkForm';
import { SlackUserLinksList } from 'src/front-components/components/SlackUserLinksList';
import { useCanManageSlackUserLinks } from 'src/front-components/hooks/use-can-manage-slack-user-links';
import { useSlackUserLinks } from 'src/front-components/hooks/use-slack-user-links';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: 100%;
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[4]};
  width: 100%;
`;

export const SlackUserLinksSettings = () => {
  const { canManage, isPermissionLoading } = useCanManageSlackUserLinks();
  const {
    slackUserLinks,
    isSlackUserLinksLoading,
    errorMessage,
    refetchSlackUserLinks,
  } = useSlackUserLinks();

  if (isPermissionLoading) {
    return <StyledCenteredState>Loading Slack user links…</StyledCenteredState>;
  }

  return (
    <StyledContainer>
      {!canManage && (
        <Callout
          variant="warning"
          title="You need the workspace members permission"
          description="Only members with the workspace members permission can create or change Slack user links. You can review the existing links below."
        />
      )}
      {canManage && <SlackUserLinkForm onLinkSaved={refetchSlackUserLinks} />}
      <Section>
        <H2Title
          title="Slack user links"
          description="Each link maps a Slack account to the workspace member whose permissions the assistant borrows."
        />
        {isSlackUserLinksLoading ? (
          <StyledCenteredState>Loading links…</StyledCenteredState>
        ) : errorMessage !== undefined ? (
          <StyledCenteredState>{errorMessage}</StyledCenteredState>
        ) : (
          <SlackUserLinksList slackUserLinks={slackUserLinks} />
        )}
      </Section>
    </StyledContainer>
  );
};
