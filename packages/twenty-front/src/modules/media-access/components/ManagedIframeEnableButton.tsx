import { MANAGED_IFRAME_ENABLE_BUTTON_INSET_PX } from '@/media-access/constants/ManagedIframeEnableButtonInsetPx';
import { autoUpdate, hide, offset, useFloating } from '@floating-ui/react';
import { styled } from '@linaria/react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type ManagedIframeEnableButtonProps = {
  anchorElement: Element;
  label: string;
  onClick: () => void;
};

const StyledControls = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  padding: ${themeCssVariables.spacing[2]};
`;

export const ManagedIframeEnableButton = ({
  anchorElement,
  label,
  onClick,
}: ManagedIframeEnableButtonProps) => {
  const { refs, floatingStyles, middlewareData, isPositioned } = useFloating({
    elements: { reference: anchorElement },
    placement: 'bottom-end',
    middleware: [
      offset(({ rects }) => ({
        mainAxis: -(
          rects.floating.height + MANAGED_IFRAME_ENABLE_BUTTON_INSET_PX
        ),
        alignmentAxis: MANAGED_IFRAME_ENABLE_BUTTON_INSET_PX,
      })),
      hide(),
    ],
    whileElementsMounted: autoUpdate,
  });
  const isHidden = !isPositioned || middlewareData.hide?.referenceHidden;

  return (
    <StyledControls
      ref={refs.setFloating}
      style={{ ...floatingStyles, visibility: isHidden ? 'hidden' : 'visible' }}
    >
      <Button size="sm" variant="outline" onClick={onClick}>
        {label}
      </Button>
    </StyledControls>
  );
};
