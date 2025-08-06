import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIcons } from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { ColumnDefinition } from '../../types/ColumnDefinition';

type RecordTableColumnHeadProps = {
  column: ColumnDefinition<FieldMetadata>;
};

const StyledTitle = styled.div<{ hideTitle?: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};

  ${({ hideTitle }) =>
    hideTitle &&
    css`
      @media (max-width: ${MOBILE_VIEWPORT}px) {
        display: none;
      }
    `}
`;

const StyledIcon = styled.div`
  display: flex;
  flex-shrink: 0;

  & > svg {
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RecordTableColumnHead = ({
  column,
}: RecordTableColumnHeadProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();
  const Icon = getIcon(column.iconName);

  const isRecordTableScrolledLeft = useRecoilComponentValue(
    isRecordTableScrolledLeftComponentState,
  );

  return (
    <StyledTitle
      hideTitle={!!column.isLabelIdentifier && !isRecordTableScrolledLeft}
    >
      <StyledIcon>
        <Icon size={theme.icon.size.md} />
      </StyledIcon>
      <StyledText>{column.label}</StyledText>
    </StyledTitle>
  );
};
