// a template header carries either text parameters or media, never both
export const hasSingleTemplateHeaderKind = ({
  headerParameters,
  headerMedia,
}: {
  headerParameters: unknown[];
  headerMedia?: unknown;
}): boolean => headerParameters.length === 0 || headerMedia === undefined;
