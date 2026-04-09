import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatPageLayoutWidget<
  TWidgetConfigurationType extends
    WidgetConfigurationType = WidgetConfigurationType,
> = UniversalFlatEntityFrom<
  PageLayoutWidgetEntity<TWidgetConfigurationType>,
  'pageLayoutWidget'
>;
