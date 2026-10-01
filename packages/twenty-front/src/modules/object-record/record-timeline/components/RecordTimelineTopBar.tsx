import { type RecordTimelineZoom } from '@/object-record/record-timeline/types/RecordTimelineZoom';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledPeriodLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type RecordTimelineTopBarProps = {
  instanceId: string;
  zoom: RecordTimelineZoom;
  periodLabel: string;
  onZoomChange: (zoom: RecordTimelineZoom) => void;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
};

export const RecordTimelineTopBar = ({
  instanceId,
  zoom,
  periodLabel,
  onZoomChange,
  onPreviousPeriod,
  onNextPeriod,
  onToday,
}: RecordTimelineTopBarProps) => (
  <StyledContainer>
    <StyledSection>
      <Select
        dropdownId={`record-timeline-zoom-${instanceId}`}
        value={zoom}
        options={[
          { label: t`Week`, value: 'WEEK' as const },
          { label: t`Month`, value: 'MONTH' as const },
          { label: t`Quarter`, value: 'QUARTER' as const },
        ]}
        selectSizeVariant="small"
        dropdownWidth={120}
        onChange={onZoomChange}
      />
      <StyledPeriodLabel>{periodLabel}</StyledPeriodLabel>
    </StyledSection>
    <StyledSection>
      <Button
        aria-label={t`Previous period`}
        size="sm"
        startIcon={<IconChevronLeft />}
        onClick={onPreviousPeriod}
        variant="ghost"
      />
      <Button size="sm" onClick={onToday} variant="ghost">{t`Today`}</Button>
      <Button
        aria-label={t`Next period`}
        size="sm"
        startIcon={<IconChevronRight />}
        onClick={onNextPeriod}
        variant="ghost"
      />
    </StyledSection>
  </StyledContainer>
);
