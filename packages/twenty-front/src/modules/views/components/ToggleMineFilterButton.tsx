import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useToggleMineFilter } from '@/views/hooks/useToggleMineFilter';
import { isToggleMineSelectedPerViewState } from '@/views/states/isToggleMineSelectedPerViewState';
import { toggleMineFilterPerViewState } from '@/views/states/toggleMineFilterPerViewState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { SegmentedControl } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

type ToggleMineFilterValue = 'all' | 'mine';

const StyledToggleMineFilterContainer = styled.div`
  display: flex;
  flex-shrink: 0;

  [data-checked]:not([data-disabled]) {
    background: ${themeCssVariables.color.blue};
    color: color(display-p3 1 1 1);
  }

  [data-disabled] {
    color: ${themeCssVariables.font.color.light};
  }
`;

type ToggleMineFilterButtonProps = {
  viewBarId: string;
  objectNameSingular: string;
};

export const ToggleMineFilterButton = ({
  viewBarId,
  objectNameSingular,
}: ToggleMineFilterButtonProps) => {
  const {
    viewId,
    toggleMineFilterFieldMetadataItem,
    isToggleMineFilterBlocked,
    isMineSelected,
  } = useToggleMineFilter({ viewBarId, objectNameSingular });

  const setIsToggleMineSelectedPerView = useSetAtomState(
    isToggleMineSelectedPerViewState,
  );

  const setToggleMineFilterPerView = useSetAtomState(
    toggleMineFilterPerViewState,
  );

  if (!isDefined(viewId) || !isDefined(toggleMineFilterFieldMetadataItem)) {
    return null;
  }

  const handleValueChange = (value: ToggleMineFilterValue) => {
    const isMineSelectedNext = value === 'mine';

    setIsToggleMineSelectedPerView((previous) => ({
      ...previous,
      [viewId]: isMineSelectedNext,
    }));

    setToggleMineFilterPerView((previous) => ({
      ...previous,
      [viewId]: isMineSelectedNext,
    }));
  };

  const fieldLabel = toggleMineFilterFieldMetadataItem.label;

  return (
    <Tooltip
      content={t`${fieldLabel} filter active`}
      delay={TooltipDelay.shortDelay}
      disabled={!isToggleMineFilterBlocked}
    >
      <StyledToggleMineFilterContainer>
        <SegmentedControl<ToggleMineFilterValue>
          aria-label={t`Show all or only my records`}
          itemWidth="content"
          disabled={isToggleMineFilterBlocked}
          value={isMineSelected ? 'mine' : 'all'}
          onValueChange={handleValueChange}
          options={[
            { value: 'all', label: t`All` },
            { value: 'mine', label: t`Mine` },
          ]}
        />
      </StyledToggleMineFilterContainer>
    </Tooltip>
  );
};
