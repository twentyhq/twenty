import styled from '@emotion/styled';

export const StyledBoard = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

export type BoardItemKey = `item-${number}`;
export interface Item {
  id: string;
  content: string;
}
export interface Items {
  [key: string]: Item;
}
export interface Column {
  id: string;
  title: string;
  colorCode?: string;
  itemKeys: BoardItemKey[];
}
