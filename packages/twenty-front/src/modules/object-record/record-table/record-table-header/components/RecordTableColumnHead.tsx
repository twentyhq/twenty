import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { isFieldMetadataItemLabelIdentifierSelector } from '@/object-metadata/states/isFieldMetadataItemLabelIdentifierSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

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

type RecordTableColumnHeadProps = {
  recordField: RecordField;
};

export const RecordTableColumnHead = ({
  recordField,
}: RecordTableColumnHeadProps) => {
  const theme = useTheme();

  const correspondingFieldMetadataItem = useRecoilValue(
    fieldMetadataItemByIdSelector({
      fieldMetadataItemId: recordField.fieldMetadataItemId,
    }),
  );

  const { getIcon } = useIcons();
  const Icon = getIcon(
    correspondingFieldMetadataItem.foundFieldMetadataItem?.icon,
  );

  const isLabelIdentifier = useRecoilValue(
    isFieldMetadataItemLabelIdentifierSelector({
      fieldMetadataItemId: recordField.fieldMetadataItemId,
    }),
  );

  const shouldCompactRecordTableFirstColumn = useRecoilComponentValue(
    shouldCompactRecordTableFirstColumnComponentState,
  );

  const shouldHideTitle =
    shouldCompactRecordTableFirstColumn && isLabelIdentifier;

  return (
    <StyledTitle hideTitle={shouldHideTitle}>
      <StyledIcon>
        <Icon size={theme.icon.size.md} />
      </StyledIcon>
      <StyledText>
        {correspondingFieldMetadataItem.foundFieldMetadataItem?.label}
      </StyledText>
    </StyledTitle>
  );
};
