import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledNavigation = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

type SettingsValidationRulePreviewNavigationProps = {
  recordIndex: number;
  recordCount: number;
  onRecordIndexChange: (recordIndex: number) => void;
};

export const SettingsValidationRulePreviewNavigation = ({
  recordIndex,
  recordCount,
  onRecordIndexChange,
}: SettingsValidationRulePreviewNavigationProps) => {
  const { t } = useLingui();

  const recordNumber = recordIndex + 1;

  return (
    <StyledNavigation>
      {t`Record ${recordNumber} of ${recordCount}`}
      <LightIconButton
        aria-label={t`Previous record`}
        disabled={recordIndex === 0}
        onClick={() => onRecordIndexChange(recordIndex - 1)}
      >
        <IconChevronUp />
      </LightIconButton>
      <LightIconButton
        aria-label={t`Next record`}
        disabled={recordNumber === recordCount}
        onClick={() => onRecordIndexChange(recordIndex + 1)}
      >
        <IconChevronDown />
      </LightIconButton>
    </StyledNavigation>
  );
};
