export type DateScalarMode = 'isoDate' | 'timestamp';
export type NumberScalarMode = 'float' | 'integer';

export interface WorkspaceBuildSchemaOptions {
  /**
   * Date scalar mode
   * @default 'isoDate'
   */
  dateScalarMode?: DateScalarMode;

  /**
   * Number scalar mode
   * @default 'float'
   */
  numberScalarMode?: NumberScalarMode;

  /**
   * Workspace ID - used to relation connect feature flag check
   * TODO: remove once IS_RELATION_CONNECT_ENABLED is removed
   */
  workspaceId?: string;
}
