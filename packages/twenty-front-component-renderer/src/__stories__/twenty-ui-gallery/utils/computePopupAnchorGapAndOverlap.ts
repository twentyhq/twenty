type ElementBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const computePopupAnchorGapAndOverlap = ({
  anchor,
  popup,
  side,
}: {
  anchor: ElementBounds;
  popup: ElementBounds;
  side: string | null;
}) => {
  const isHorizontallyPositioned = side === 'left' || side === 'right';
  const anchorRight = anchor.x + anchor.width;
  const anchorBottom = anchor.y + anchor.height;
  const popupRight = popup.x + popup.width;
  const popupBottom = popup.y + popup.height;

  if (isHorizontallyPositioned) {
    return {
      popupAnchorGap: Math.max(popup.x - anchorRight, anchor.x - popupRight),
      popupOverlapStart: popup.y,
      popupOverlapEnd: popupBottom,
      anchorOverlapStart: anchor.y,
      anchorOverlapEnd: anchorBottom,
    };
  }

  return {
    popupAnchorGap: Math.max(popup.y - anchorBottom, anchor.y - popupBottom),
    popupOverlapStart: popup.x,
    popupOverlapEnd: popupRight,
    anchorOverlapStart: anchor.x,
    anchorOverlapEnd: anchorRight,
  };
};
