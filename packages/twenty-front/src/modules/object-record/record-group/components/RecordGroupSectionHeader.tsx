import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordGroupChip } from '@/object-record/record-group/components/RecordGroupChip';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSectionToggle = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0;
`;

const StyledChevronContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  transform: rotate(${({ isExpanded }) => (isExpanded ? 0 : -90)}deg);
`;

type RecordGroupSectionHeaderProps = {
  recordGroupDefinition: RecordGroupDefinition;
  fieldMetadataItem?: FieldMetadataItem | null;
  isExpanded: boolean;
  onToggle: () => void;
  chevronWidth?: number;
};

export const RecordGroupSectionHeader = ({
  recordGroupDefinition,
  fieldMetadataItem,
  isExpanded,
  onToggle,
  chevronWidth,
}: RecordGroupSectionHeaderProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledSectionToggle
      type="button"
      aria-expanded={isExpanded}
      aria-label={t`Toggle ${recordGroupDefinition.title} group`}
      onClick={onToggle}
    >
      <StyledChevronContainer
        isExpanded={isExpanded}
        style={{ minWidth: chevronWidth, width: chevronWidth }}
      >
        <IconChevronDown
          aria-hidden
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      </StyledChevronContainer>
      <RecordGroupChip
        recordGroupDefinition={recordGroupDefinition}
        fieldMetadataItem={fieldMetadataItem}
        valueTagWeight="medium"
      />
    </StyledSectionToggle>
  );
};
