import { useLingui } from '@lingui/react/macro';
import {
  H2Title,
  IconArrowLeft,
  IconArrowRight,
  IconDownload,
  useIcons,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { EXPORT_FORMAT_OPTIONS } from '../constants/exportFormatOptions';
import type { ExportFormat } from '../types/exportFormat';
import {
  StyledFormatDescription,
  StyledFormatDetails,
  StyledFormatIcon,
  StyledFormatOption,
  StyledFormatSelectionContainer,
  StyledFormatTitle,
  StyledNavigationButtons,
} from './SettingsExport.styles';

export const FormatSelectionStep = ({
  selectedFormat,
  onFormatChange,
  onBack,
  onNext,
  onExport,
  selectedCount,
}: {
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onBack: () => void;
  onNext: () => void;
  onExport: () => void;
  selectedCount: number;
}) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const isJsonFormat = selectedFormat === 'json';

  return (
    <StyledFormatSelectionContainer>
      <H2Title
        title={t`Select Export Format`}
        description={t`Choose the format for exporting ${selectedCount} selected objects`}
      />
      {EXPORT_FORMAT_OPTIONS.map((option) => {
        const Icon = getIcon(option.icon);
        const isSelected = selectedFormat === option.value;
        return (
          <StyledFormatOption
            key={option.value}
            selected={isSelected}
            onClick={() => onFormatChange(option.value)}
          >
            <StyledFormatIcon selected={isSelected}>
              {Icon !== null && <Icon size={20} />}
            </StyledFormatIcon>
            <StyledFormatDetails>
              <StyledFormatTitle>{option.label}</StyledFormatTitle>
              <StyledFormatDescription>
                {option.description}
              </StyledFormatDescription>
            </StyledFormatDetails>
          </StyledFormatOption>
        );
      })}
      <StyledNavigationButtons>
        <Button
          Icon={IconArrowLeft}
          title={t`Back to Object Selection`}
          variant="secondary"
          onClick={onBack}
        />
        {isJsonFormat ? (
          <Button
            Icon={IconArrowRight}
            title={t`Continue`}
            accent="blue"
            onClick={onNext}
          />
        ) : (
          <Button
            Icon={IconDownload}
            title={t`Export ${selectedCount} Objects`}
            accent="blue"
            onClick={onExport}
          />
        )}
      </StyledNavigationButtons>
    </StyledFormatSelectionContainer>
  );
};
