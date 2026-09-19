import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCheck, IconChecks } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useAiChatOwnMessageReadReceipt } from '@/ai/hooks/useAiChatOwnMessageReadReceipt';
import { getWorkspaceMemberFullName } from '@/ai/utils/getWorkspaceMemberFullName';

const MAX_NAMED_READERS = 2;

const StyledReceiptRow = styled.div<{ isRead: boolean }>`
  align-items: center;
  color: ${({ isRead }) =>
    isRead ? themeCssVariables.color.blue : themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[1]};
`;

type AiChatMessageReadReceiptProps = {
  messageId: string;
};

export const AiChatMessageReadReceipt = ({
  messageId,
}: AiChatMessageReadReceiptProps) => {
  const { t } = useLingui();
  const { shouldDisplayReceipt, readers } =
    useAiChatOwnMessageReadReceipt(messageId);

  if (!shouldDisplayReceipt) {
    return null;
  }

  const isRead = readers.length > 0;

  if (!isRead) {
    return (
      <StyledReceiptRow isRead={false}>
        <IconCheck size={14} />
        <span>{t`Sent`}</span>
      </StyledReceiptRow>
    );
  }

  const readerNames = readers.map(getWorkspaceMemberFullName);
  const namedReaders = readerNames.slice(0, MAX_NAMED_READERS).join(', ');
  const unnamedReaderCount = readerNames.length - MAX_NAMED_READERS;

  return (
    <StyledReceiptRow isRead={true}>
      <IconChecks size={14} />
      <span>
        {unnamedReaderCount > 0
          ? t`Read by ${namedReaders} +${unnamedReaderCount}`
          : t`Read by ${namedReaders}`}
      </span>
    </StyledReceiptRow>
  );
};
