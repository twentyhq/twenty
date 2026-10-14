export const TRAVERSED_FIELD_LABEL_SEPARATOR = ' › ';

export const getTraversedFieldLabel = ({
  relationFieldLabel,
  targetFieldLabel,
}: {
  relationFieldLabel: string;
  targetFieldLabel: string;
}) => `${relationFieldLabel}${TRAVERSED_FIELD_LABEL_SEPARATOR}${targetFieldLabel}`;
