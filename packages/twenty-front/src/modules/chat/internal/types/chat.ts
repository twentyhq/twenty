import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { CollectionReference, DocumentData } from 'firebase/firestore';
import { Dispatch, SetStateAction } from 'react';

export interface IChat {
  chatId: string;
  workspaceId: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  senderAvatarUrl: string | null | undefined;
  receiverAvatarUrl: string | null | undefined;
  messages: Message[];
}

export interface Message {
  id: string;
  type: 'text' | 'img' | 'doc' | 'audio' | 'video';
  text: string | undefined;
  fileName: string | undefined;
  createdAt: TDateFirestore;
  senderId: string | undefined;
  senderName: string | undefined;
  senderAvatarUrl: string | null | undefined;
  chatId?: string; // will be used only in the search
}

export type TDateFirestore = {
  seconds: number;
  nanoseconds: number;
};

export interface IChatPreview {
  chatId: string;
  lastMessagePreview: string | undefined;
  lastMessageDate: TDateFirestore;
  lastMessageSenderName: string | undefined;
  senderId: string | undefined;
  receiverId: string | undefined;
  senderName: string | undefined;
  receiverName: string | undefined;
  senderAvatarUrl: string | null | undefined;
  receiverAvatarUrl: string | null | undefined;
  unreadMessages: number;
}

export interface IChatUser {
  userId: string;
  workspaceId: string;
  name: string;
  avatarUrl: string | null | undefined;
  chats: IChatPreview[];
  status: 'Available' | 'Busy' | 'Away';
}

export interface ISearchResult {
  users: IChatUser[];
  messages: Message[];
}

export type ChatContextType = {
  openChat: IChat | undefined;
  userChat: IChatUser | undefined;
  createUser: (
    workspaceId: string,
    user: CurrentWorkspaceMember | null,
  ) => Promise<void>;
  usersRef: CollectionReference<DocumentData, DocumentData>;
  chatsRef: CollectionReference<DocumentData, DocumentData>;
  setWorkspaceUsers: Dispatch<SetStateAction<IChatUser[]>>;
  setOpenChat: Dispatch<SetStateAction<IChat | undefined>>;
  workspaceUsers: IChatUser[];
  setUserChat: Dispatch<SetStateAction<IChatUser | undefined>>;
  handleAddChat: (
    senderId?: string,
    senderName?: string,
    receiverId?: string,
    receiverName?: string,
    workspaceId?: string,
    senderAvatarUrl?: string | null,
    receiverAvatarUrl?: string | null,
  ) => Promise<undefined | string>;
  setChatId: Dispatch<SetStateAction<string>>;
  chatId: string;
  handleSendMessage: (
    chatId?: string,
    type?: 'img' | 'doc' | 'audio' | undefined,
    url?: string,
    fileName?: string,
  ) => Promise<void>;
  setNewMessage: Dispatch<SetStateAction<string>>;
  isNewChatOpen: boolean;
  setIsNewChatOpen: Dispatch<SetStateAction<boolean>>;
  newMessage: string;
  otherUserStatus: string;
  formatDate: (message: TDateFirestore) => {
    date: string;
    time: string;
  };
  isStatusOpen: boolean;
  setIsStatusOpen: Dispatch<SetStateAction<boolean>>;
  thisUserStatus: string;
  setThisUserStatus: Dispatch<SetStateAction<'Available' | 'Busy' | 'Away'>>;
  isServiceStatusOpen: boolean;
  setIsServiceStatusOpen: Dispatch<SetStateAction<boolean>>;
  thisServiceStatus: string;
  setThisServiceStatus: Dispatch<
    SetStateAction<
      'Resolved' | 'In progress' | 'Waiting' | 'On hold' | 'Pending'
    >
  >;
  isSearchOpen: boolean;
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  handleSearch: (searchQuery: string) => Promise<void>;
  queryResult: ISearchResult | null;
  sortChats: () => void;
  isAnexOpen: boolean;
  setIsAnexOpen: Dispatch<SetStateAction<boolean>>;
  imageUpload: File | null;
  setImageUpload: Dispatch<SetStateAction<File | null>>;
  fileUpload: File | null;
  setFileUpload: Dispatch<SetStateAction<File | null>>;
  uploadFile: (
    file: File,
    type: 'img' | 'doc' | 'audio' | 'video',
  ) => Promise<void>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  findUserAvatar: (userId: string | undefined) => string | null | undefined;
  findAndSetChat: (userId: string) => Promise<void>;
  goToMessage: (chatId: string, messageId: string) => Promise<void>;
  goingToMessageIndex: number | undefined;
  setGoingToMessageIndex: Dispatch<SetStateAction<number | undefined>>;
  isDetailsOpen: boolean;
  setIsDetailsOpen: Dispatch<SetStateAction<boolean>>;
};
