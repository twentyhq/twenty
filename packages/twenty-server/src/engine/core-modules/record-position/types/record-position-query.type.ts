export type FindByPositionQueryArgs = {
  positionValue: number | null;
  recordPositionQueryType: RecordPositionQueryType.FIND_BY_POSITION;
};

export type FindMinPositionQueryArgs = {
  recordPositionQueryType: RecordPositionQueryType.FIND_MIN_POSITION;
};

export type FindMaxPositionQueryArgs = {
  recordPositionQueryType: RecordPositionQueryType.FIND_MAX_POSITION;
};

export type UpdatePositionQueryArgs = {
  recordId: string;
  positionValue: number;
  recordPositionQueryType: RecordPositionQueryType.UPDATE_POSITION;
};

export enum RecordPositionQueryType {
  FIND_MIN_POSITION = 'FIND_MIN_POSITION',
  FIND_MAX_POSITION = 'FIND_MAX_POSITION',
  FIND_BY_POSITION = 'FIND_BY_POSITION',
  UPDATE_POSITION = 'UPDATE_POSITION',
}

export type RecordPositionQueryArgs =
  | FindByPositionQueryArgs
  | FindMinPositionQueryArgs
  | FindMaxPositionQueryArgs
  | UpdatePositionQueryArgs;
