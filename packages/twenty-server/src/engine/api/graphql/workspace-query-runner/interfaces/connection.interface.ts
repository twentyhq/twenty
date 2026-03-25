import { type IPageInfo } from './page-info.interface';
import { type IEdge } from './edge.interface';

export interface IConnection<T, CustomEdge extends IEdge<T> = IEdge<T>> {
  edges: Array<CustomEdge>;
  pageInfo: IPageInfo;
  totalCount: number;
}
