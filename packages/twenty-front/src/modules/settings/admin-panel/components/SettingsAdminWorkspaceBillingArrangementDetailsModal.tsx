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
import { useUsageLimitFormatter } from '@/settings/billing/hooks/useUsageLimitFormatter';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { beautifyExactDate } from '~/utils/date-utils';

type SettingsAdminWorkspaceBillingArrangementDetailsModalProps = {
  modalInstanceId: string;
  arrangement: AdminBillingArrangement;
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
  const { formatLimitValue } = useUsageLimitFormatter();

  const status = BILLING_ARRANGEMENT_STATUS_TAGS[arrangement.status];
  const typeLabel = t(BILLING_ARRANGEMENT_TYPE_LABELS[arrangement.type]);

  const items = [
    {
      Icon: IconTag,
      label: t`Type`,
      value: typeLabel,
    },
    {
      Icon: IconBox,
      label: t`Details`,
      value: formatAdminBillingArrangementDetails({
        arrangement,
        formatNumber,
        formatLimitValue,
      }),
    },
    {
      Icon: IconHelpCircle,
      label: t`Reason`,
      value: t(BILLING_ARRANGEMENT_REASON_LABELS[arrangement.label]),
    },
    {
      Icon: IconStatusChange,
      label: t`Status`,
      value: <Tag color={status.color}>{t(status.label)}</Tag>,
    },
    {
      Icon: IconCalendarEvent,
      label: t`Starts`,
      value: beautifyExactDate(arrangement.startsAt),
    },
    {
      Icon: IconCalendarX,
      label: t`Ends`,
      value: formatAdminBillingArrangementEndDate(arrangement),
    },
    {
      Icon: IconUserPlus,
      label: t`Added by`,
      value: isDefined(arrangement.grantedBy)
        ? formatAdminBillingArrangementOperator(arrangement.grantedBy)
        : EM_DASH,
    },
    {
      Icon: IconCalendar,
      label: t`Added on`,
      value: beautifyExactDate(arrangement.createdAt),
    },
    ...(isDefined(arrangement.revokedBy)
      ? [
          {
            Icon: IconUserOff,
            label: t`Ended by`,
            value: formatAdminBillingArrangementOperator(arrangement.revokedBy),
          },
        ]
      : []),
  ];

  return (
    <DialogInstance dialogId={modalInstanceId} dismissible renderInDocumentBody>
      {({ onKeyDown }) => (
        <Dialog.Popup
          onKeyDown={onKeyDown}
          size="md"
          data-globally-prevent-click-outside
        >
          <Dialog.Header>
            <Dialog.Title>{typeLabel}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <SettingsTableCard items={items} gridAutoColumns="1fr 2fr" />
            {isDefined(arrangement.comment) && (
              <>
                <StyledCommentLabel>{t`Comment`}</StyledCommentLabel>
                <StyledComment>{arrangement.comment}</StyledComment>
              </>
            )}
          </Dialog.Body>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
