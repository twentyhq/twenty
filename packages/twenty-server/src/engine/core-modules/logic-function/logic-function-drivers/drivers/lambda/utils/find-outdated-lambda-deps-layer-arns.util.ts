import { isDefined } from 'twenty-shared/utils';

import { getLambdaLayerNameFromArn } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-layer-name-from-arn.util';

export const findOutdatedLambdaDepsLayerArns = ({
  layerArns,
  depsLayerNames,
  sdkLayerName,
}: {
  layerArns: string[];
  depsLayerNames: string[];
  sdkLayerName: string;
}): string[] =>
  layerArns.filter((layerArn) => {
    const layerName = getLambdaLayerNameFromArn(layerArn);

    return (
      !isDefined(layerName) ||
      (layerName !== sdkLayerName && !depsLayerNames.includes(layerName))
    );
  });
