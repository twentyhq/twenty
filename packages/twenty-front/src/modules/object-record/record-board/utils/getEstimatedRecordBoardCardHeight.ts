import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';

// RecordCardHeaderContainer: height (32px) + padding top spacing(2) + padding bottom spacing(1)
const BOARD_CARD_HEADER_HEIGHT = 32 + 8 + 4;

// Per field row: skeleton height + RecordCardBodyContainer padding-bottom spacing(2) + StyledBodyContainer gap spacing(0.5)
const BOARD_CARD_FIELD_ROW_HEIGHT =
  SKELETON_LOADER_HEIGHT_SIZES.standard.s + 8 + 2;

// StyledBodyContainer padding (4+4) + card border (2×1px) + StyledSkeletonCardContainer margin-bottom spacing(2)
const BOARD_CARD_CHROME_HEIGHT = 8 + 2 + 8;

export const getEstimatedRecordBoardCardHeight = (
  numberOfVisibleRecordFields: number,
) =>
  BOARD_CARD_HEADER_HEIGHT +
  numberOfVisibleRecordFields * BOARD_CARD_FIELD_ROW_HEIGHT +
  BOARD_CARD_CHROME_HEIGHT;
