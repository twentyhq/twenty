import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconAlertTriangle, IconBell } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { selectedInboxNotificationIdState } from '@/ai/expanded-chat/states/selectedInboxNotificationIdState';
import { useNotificationActions } from '@/notification/hooks/useNotificationActions';
import { type Notification } from '@/notification/types/Notification';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-width: 520px;
  padding: ${themeCssVariables.spacing[5]};
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledTime = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  margin-left: auto;
`;

const StyledPreview = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconContainer = styled.div<{ isAlert: boolean }>`
  align-items: center;
  color: ${({ isAlert }) =>
    isAlert
      ? themeCssVariables.color.orange
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

type NotificationDetailProps = {
  notification: Notification;
};

export const NotificationDetail = ({
  notification,
}: NotificationDetailProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { markNotificationDone } = useNotificationActions();
  const setSelectedInboxNotificationId = useSetAtomState(
    selectedInboxNotificationIdState,
  );

  const subjectObjectNameSingular = notification.payload?.objectNameSingular;
  const canOpenSubjectRecord =
    isNonEmptyString(notification.subjectRecordId) &&
    isNonEmptyString(subjectObjectNameSingular);

  const handleOpenSubjectRecord = () => {
    if (!canOpenSubjectRecord) {
      return;
    }

    navigate(
      getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: subjectObjectNameSingular,
        objectRecordId: notification.subjectRecordId,
      }),
    );
  };

  const handleMarkDone = async () => {
    const didUpdate = await markNotificationDone(notification.id);

    if (didUpdate) {
      setSelectedInboxNotificationId(null);
    }
  };

  const Icon = notification.requiresAction ? IconAlertTriangle : IconBell;

  return (
    <StyledContainer>
      <StyledCard>
        <StyledHeader>
          <StyledIconContainer isAlert={notification.requiresAction}>
            <Icon size={theme.icon.size.md} />
          </StyledIconContainer>
          <StyledTitle>{notification.title}</StyledTitle>
          <StyledTime>
            {beautifyPastDateRelativeToNow(notification.createdAt)}
          </StyledTime>
        </StyledHeader>
        {isNonEmptyString(notification.preview) && (
          <StyledPreview>{notification.preview}</StyledPreview>
        )}
        <StyledActions>
          {canOpenSubjectRecord && (
            <Button
              variant="primary"
              accent="blue"
              size="small"
              title={t`Open record`}
              onClick={handleOpenSubjectRecord}
            />
          )}
          <Button
            variant="secondary"
            size="small"
            title={t`Mark done`}
            onClick={handleMarkDone}
          />
        </StyledActions>
      </StyledCard>
    </StyledContainer>
  );
};
