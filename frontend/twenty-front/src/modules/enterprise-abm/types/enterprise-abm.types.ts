export type AbmItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type AbmListProps = {
  items: AbmItem[];
  isLoading: boolean;
};
