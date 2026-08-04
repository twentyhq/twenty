// RecordCard border (2×1px) + RecordCardHeaderContainer fixed height (32px, border-box)
const BOARD_CARD_HEADER_AND_BORDER_HEIGHT = 2 + 32;

// StyledLabelAndIconContainer fixed height per field row
const BOARD_CARD_FIELD_ROW_HEIGHT = 24;

// RecordCardBodyContainer gap spacing(0.5) between field rows
const BOARD_CARD_FIELD_ROW_GAP = 2;

// RecordCardBodyContainer padding-bottom spacing(2)
const BOARD_CARD_BODY_PADDING_BOTTOM = 8;

// StyledBoardCardWrapper padding-bottom spacing(2)
const BOARD_CARD_WRAPPER_PADDING_BOTTOM = 8;

export const getEstimatedRecordBoardCardHeight = ({
  numberOfVisibleBodyFields,
  isCompactModeActive,
}: {
  numberOfVisibleBodyFields: number;
  isCompactModeActive: boolean;
}) => {
  if (isCompactModeActive) {
    return (
      BOARD_CARD_HEADER_AND_BORDER_HEIGHT + BOARD_CARD_WRAPPER_PADDING_BOTTOM
    );
  }

  const bodyHeight =
    numberOfVisibleBodyFields * BOARD_CARD_FIELD_ROW_HEIGHT +
    Math.max(numberOfVisibleBodyFields - 1, 0) * BOARD_CARD_FIELD_ROW_GAP +
    BOARD_CARD_BODY_PADDING_BOTTOM;

  return (
    BOARD_CARD_HEADER_AND_BORDER_HEIGHT +
    bodyHeight +
    BOARD_CARD_WRAPPER_PADDING_BOTTOM
  );
};
