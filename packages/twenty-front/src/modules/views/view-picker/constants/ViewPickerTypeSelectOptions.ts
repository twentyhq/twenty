import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';

export const getViewPickerTypeSelectOptions = (t: (key: TemplateStringsArray) => string) => [
    {
        value: ViewType.Table,
        label: t`Table`,
        Icon: viewTypeIconMapping(ViewType.Table),
    },
    {
        value: ViewType.Kanban,
        label: t`Kanban`,
        Icon: viewTypeIconMapping(ViewType.Kanban),
    }
];
