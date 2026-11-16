import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBox,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarX,
  IconHelpCircle,
  IconStatusChange,
  IconTag,
  IconUserOff,
  IconUserPlus,
} from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { BILLING_ARRANGEMENT_REASON_LABELS } from '@/settings/admin-panel/constants/BillingArrangementReasonLabels';
import { BILLING_ARRANGEMENT_STATUS_TAGS } from '@/settings/admin-panel/constants/BillingArrangementStatusTags';
import { BILLING_ARRANGEMENT_TYPE_LABELS } from '@/settings/admin-panel/constants/BillingArrangementTypeLabels';
import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';
import { formatAdminBillingArrangementDetails } from '@/settings/admin-panel/utils/formatAdminBillingArrangementDetails';
import { formatAdminBillingArrangementEndDate } from '@/settings/admin-panel/utils/formatAdminBillingArrangementEndDate';
import { formatAdminBillingArrangementOperator } from '@/settings/admin-panel/utils/formatAdminBillingArrangementOperator';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { beautifyExactDate } from '~/utils/date-utils';

type SettingsAdminWorkspaceBillingArrangementDetailsModalProps = {
  modalInstanceId: string;
  arrangement: AdminBillingArrangement | null;
};

const EM_DASH = '—';

const StyledCommentLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledComment = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: ${themeCssVariables.spacing[1]} 0 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

export const SettingsAdminWorkspaceBillingArrangementDetailsModal = ({
  modalInstanceId,
  arrangement,
}: SettingsAdminWorkspaceBillingArrangementDetailsModalProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const buildItems = (selectedArrangement: AdminBillingArrangement) => {
    const status = BILLING_ARRANGEMENT_STATUS_TAGS[selectedArrangement.status];

    return [
      {
        Icon: IconTag,
        label: t`Type`,
        value: t(BILLING_ARRANGEMENT_TYPE_LABELS[selectedArrangement.type]),
      },
      {
        Icon: IconBox,
        label: t`Details`,
        value: formatAdminBillingArrangementDetails({
          arrangement: selectedArrangement,
          formatNumber,
        }),
      },
      {
        Icon: IconHelpCircle,
        label: t`Reason`,
        value: t(BILLING_ARRANGEMENT_REASON_LABELS[selectedArrangement.label]),
      },
      {
        Icon: IconStatusChange,
        label: t`Status`,
        value: <Tag color={status.color}>{t(status.label)}</Tag>,
      },
      {
        Icon: IconCalendarEvent,
        label: t`Starts`,
        value: beautifyExactDate(selectedArrangement.startsAt),
      },
      {
        Icon: IconCalendarX,
        label: t`Ends`,
        value: formatAdminBillingArrangementEndDate(selectedArrangement),
      },
      {
        Icon: IconUserPlus,
        label: t`Added by`,
        value: isDefined(selectedArrangement.grantedBy)
          ? formatAdminBillingArrangementOperator(selectedArrangement.grantedBy)
          : EM_DASH,
      },
      {
        Icon: IconCalendar,
        label: t`Added on`,
        value: beautifyExactDate(selectedArrangement.createdAt),
      },
      ...(isDefined(selectedArrangement.revokedBy)
        ? [
            {
              Icon: IconUserOff,
              label: t`Ended by`,
              value: formatAdminBillingArrangementOperator(
                selectedArrangement.revokedBy,
              ),
            },
          ]
        : []),
    ];
  };

  return (
    <DialogInstance dialogId={modalInstanceId} dismissible renderInDocumentBody>
      {({ onKeyDown }) => (
        <Dialog.Popup
          onKeyDown={onKeyDown}
          size="md"
          data-globally-prevent-click-outside
        >
          <Dialog.Header>
            <Dialog.Title>
              {isDefined(arrangement)
                ? t(BILLING_ARRANGEMENT_TYPE_LABELS[arrangement.type])
                : t`Arrangement`}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {isDefined(arrangement) && (
              <>
                <SettingsTableCard
                  items={buildItems(arrangement)}
                  gridAutoColumns="1fr 2fr"
                />
                {isDefined(arrangement.comment) && (
                  <>
                    <StyledCommentLabel>{t`Comment`}</StyledCommentLabel>
                    <StyledComment>{arrangement.comment}</StyledComment>
                  </>
                )}
              </>
            )}
          </Dialog.Body>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
