import ListPanelItem from '../ListPanelItem';

export default {
  title: 'ListPanel',
  component: ListPanelItem,
};

export const ListPanelItemDefault = () => (
  <ListPanelItem
    task={{
      id: 1,
      targetUser: 'Sylvie Vartan',
      label: 'Guest at #xxx property',
      time: '3h',
      lastMessage:
        'I’m looking for my order but couldn’t find it. Could you help me find it. I don’t know where ...',
    }}
  />
);
