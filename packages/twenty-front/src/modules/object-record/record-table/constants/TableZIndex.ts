export const TABLE_Z_INDEX = {
  base: 1,
  cell: {
    default: 8,
    sticky: 12,
    editMode: 30,
  },
  headerColumnsSticky: 14,
  headerColumnsNormal: 10,
  firstCellWithoutVerticalScroll: 15,
  firstCellWithVerticalScroll: 12,
  noScrollAtAll: {
    hoverPortalCellOnFirstScrollableColumn: 17,
    hoverPortalCellOnNormalColumn: 17,
    hoverPortalCellOnLabelIdentifierColumn: 17,
    firstScrollableHeaderCell: 12,
  },
  scrolledBothVerticallyAndHorizontally: {
    hoverPortalCellOnNormalColumn: 2,
    hoverPortalCellOnFirstScrollableColumn: 2,
    hoverPortalCellOnLabelIdentifierColumn: 2,
    firstScrollableHeaderCell: 12,
  },
  scrolledHorizontallyOnly: {
    hoverPortalCellOnLabelIdentifierColumn: 17,
    hoverPortalCellOnNormalColumn: 11,
    hoverPortalCellOnFirstScrollableColumn: 11,
    firstScrollableHeaderCell: 10,
  },
  scrolledVerticallyOnly: {
    hoverPortalCellOnNormalColumn: 9,
    hoverPortalCellOnFirstScrollableColumn: 13,
    hoverPortalCellOnLabelIdentifierColumn: 13,
    firstScrollableHeaderCell: 14,
  },
  columnGrip: 30,
  footer: {
    default: 18,
    stickyColumn: 20,
  },
};
