import { styled } from '@linaria/react';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { Input } from 'twenty-ui/primitives/input';

import { type AiChatApprovalReviewFixture } from '@/ai/components/__stories__/AiChatApprovalReviewFixture';
import { type AiChatApprovalReviewColumn } from '@/ai/types/AiChatApprovalReviewColumn';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';

const StyledNumericEditor = styled.span<{ contentWidth: number }>`
  display: inline-flex;
  inline-size: ${({ contentWidth }) => contentWidth}ch;
  min-width: 0;
`;

type AiChatApprovalReviewExampleCellProps = {
  operation: AiChatApprovalReviewFixture['operation'];
  column?: AiChatApprovalReviewColumn;
  recordLabel?: string;
  value: string;
  isReadOnly: boolean;
  onValueChange: (value: string) => void;
};

export const AiChatApprovalReviewExampleCell = ({
  operation,
  column,
  recordLabel,
  value,
  isReadOnly,
  onValueChange,
}: AiChatApprovalReviewExampleCellProps) => {
  const isEditable = operation !== 'delete';
  const isRecordChip = column?.id === 'name' || column?.id === 'company';
  const isAvatarSquare = column?.id === 'company' || operation === 'update';

  const renderValue = () => {
    if (!isEditable) {
      return <TextDisplay text={value} />;
    }

    const input = (
      <Input
        aria-label={`${recordLabel} ${column?.label}`}
        variant="plain"
        size="sm"
        value={value}
        disabled={isReadOnly}
        textAlign={column?.align === 'right' ? 'end' : 'start'}
        onValueChange={onValueChange}
      />
    );

    if (column?.align === 'right') {
      return (
        <StyledNumericEditor contentWidth={Math.max(value.length, 1)}>
          {input}
        </StyledNumericEditor>
      );
    }

    return input;
  };

  if (!isRecordChip) {
    return renderValue();
  }

  return (
    <Chip
      variant="soft"
      truncate={!isEditable}
      startElement={
        <Avatar
          name={value}
          size="xs"
          shape={isAvatarSquare ? 'square' : 'circle'}
        />
      }
    >
      {renderValue()}
    </Chip>
  );
};
