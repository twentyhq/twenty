const LAYER_NAME_ARN_SEGMENT_INDEX = 6;

export const getLambdaLayerNameFromArn = (
  layerVersionArn: string,
): string | undefined =>
  layerVersionArn.split(':')[LAYER_NAME_ARN_SEGMENT_INDEX];
