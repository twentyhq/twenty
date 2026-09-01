import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Avatar } from 'twenty-ui/data-display';
import { Button } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  SlackTableCell,
  SlackTableRow,
} from 'src/front-components/components/SlackSettingsTable';
import { SlackUserLinkFormHint } from 'src/front-components/components/SlackUserLinkFormHint';
import { WorkspaceMemberPicker } from 'src/front-components/components/WorkspaceMemberPicker';
import { useSetSlackUserLink } from 'src/front-components/hooks/use-set-slack-user-link';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { buildSlackUserLinkSaveNote } from 'src/front-components/utils/build-slack-user-link-save-note.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const StyledIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  min-width: 0;
`;

const StyledPickerCell = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledHint = styled.div`
  padding: 0 ${() => themeCssVariables.spacing[2]}
    ${() => themeCssVariables.spacing[2]};
`;

type UnlinkedSlackUserRowProps = {
  slackUser: SlackResolvedUser;
  gridTemplateColumns: string;
  onLinkSaved: () => void;
};

export const UnlinkedSlackUserRow = ({
  slackUser,
  gridTemplateColumns,
  onLinkSaved,
}: UnlinkedSlackUserRowProps) => {
  const [selectedMember, setSelectedMember] =
    useState<WorkspaceMemberOption | null>(null);
  const { setSlackUserLink, isSubmitting } = useSetSlackUserLink();

  const displayedName = isNonEmptyString(slackUser.displayName)
    ? slackUser.displayName
    : slackUser.slackUserId;

  const handleLink = async () => {
    if (!isDefined(selectedMember)) {
      return;
    }

    const result = await setSlackUserLink({
      workspaceMemberId: selectedMember.id,
      slackUserId: slackUser.slackUserId,
      slackTeamId: isNonEmptyString(slackUser.slackTeamId)
        ? slackUser.slackTeamId
        : undefined,
      name: slackUser.displayName,
    });

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });

    if (result.success) {
      setSelectedMember(null);
      onLinkSaved();
    }
  };

  return (
    <>
      <SlackTableRow gridTemplateColumns={gridTemplateColumns}>
        <SlackTableCell>
          <StyledIdentity>
            <Avatar
              placeholder={displayedName}
              placeholderColorSeed={slackUser.slackUserId}
              type="rounded"
              size="md"
            />
            <StyledName>
              <OverflowingTextWithTooltip text={displayedName} />
            </StyledName>
          </StyledIdentity>
        </SlackTableCell>
        <SlackTableCell>
          <OverflowingTextWithTooltip
            text={
              isNonEmptyString(slackUser.email)
                ? slackUser.email
                : slackUser.slackUserId
            }
          />
        </SlackTableCell>
        <SlackTableCell>
          <StyledPickerCell>
            <WorkspaceMemberPicker
              selectedMember={selectedMember}
              onSelect={setSelectedMember}
              onClear={() => setSelectedMember(null)}
              disabled={isSubmitting}
            />
          </StyledPickerCell>
          <Button
            title={isSubmitting ? 'Linking…' : 'Link'}
            size="small"
            variant="secondary"
            accent="blue"
            disabled={!isDefined(selectedMember) || isSubmitting}
            onClick={handleLink}
          />
        </SlackTableCell>
      </SlackTableRow>
      {isDefined(selectedMember) && (
        <StyledHint>
          <SlackUserLinkFormHint>
            {buildSlackUserLinkSaveNote({
              resolvedUser: slackUser,
              selectedMember,
              existingLink: undefined,
            })}
          </SlackUserLinkFormHint>
        </StyledHint>
      )}
    </>
  );
};
