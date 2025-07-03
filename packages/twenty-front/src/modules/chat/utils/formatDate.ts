import { TDateFirestore } from '@/chat/internal/types/chat';

export const formatDate = (date: TDateFirestore) => {
  const parsedDate = new Date(date.seconds * 1000);

  const hours = parsedDate.getHours().toString().padStart(2, '0');
  const minutes = parsedDate.getMinutes().toString().padStart(2, '0');

  const day = parsedDate.getDate().toString().padStart(2, '0');
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  const year = parsedDate.getFullYear();

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`,
  };
};
