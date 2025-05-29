/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import {
  CurrentWorkspaceMember,
  currentWorkspaceMemberState,
} from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFirestoreDb } from '@/chat/call-center/hooks/useFirestoreDb';
import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import {
  ChatContextType,
  IChat,
  IChatUser,
  ISearchResult,
  Message,
  TDateFirestore,
} from '@/chat/internal/types/chat';
import { MessageType } from '@/chat/types/MessageType';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import {
  and,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

export const ChatContext = createContext<ChatContextType | null>(null);

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryResult, setQueryResult] = useState<ISearchResult | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<IChatUser[]>([]);
  const [otherUserStatus, setOtherUserStatus] = useState<string>('');
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [goingToMessageIndex, setGoingToMessageIndex] = useState<
    number | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isServiceStatusOpen, setIsServiceStatusOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userChat, setUserChat] = useState<IChatUser>();
  const [isSearching, setIsSearching] = useState(false);
  const [thisUserStatus, setThisUserStatus] = useState<
    'Available' | 'Busy' | 'Away'
  >('Available');
  const [thisServiceStatus, setThisServiceStatus] = useState<
    'Resolved' | 'In progress' | 'Waiting' | 'On hold' | 'Pending'
  >('Pending');
  const [isAnexOpen, setIsAnexOpen] = useState(false);
  const [openChat, setOpenChat] = useState<IChat>();
  const [chatId, setChatId] = useState<string>('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { firestoreDb } = useFirestoreDb();

  const usersRef = collection(firestoreDb, 'users');
  const chatsRef = collection(firestoreDb, 'chats');

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  // @ts-expect-error refetch is undefined here
  // TODO: Check if refetch method is actually being used for something
  const { records: workspaceMembers, refetch: refetchMembers } =
    useFindManyRecords<WorkspaceMember>({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });

  const { uploadFileToBucket } = useUploadFileToBucket();
  const { enqueueSnackBar } = useSnackBar();
  // const { sendChatNotification } = useSendChatNotification();

  useEffect(() => {}, [refetchMembers]);

  // 1°: ver se ja existe um user com esse workspace, se nao: criar um
  useEffect(() => {
    createUser(currentWorkspace?.id, currentWorkspaceMember);

    setTimeout(() => {
      updateUser();
    }, 1000); // it has to wait to avoid race conditions with the user creation. updateUser() will update the user's avatar and name, because it can change and the avatar.url gets expired after a while

    return () => {
      updateUserStatus('Away');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2°: pegar os usuarios do workspace em tempo real (serve para atualizar o status do user)
  useEffect(() => {
    const queryUsers = query(
      usersRef,
      and(
        where('userId', '!=', currentWorkspaceMember?.id),
        where('workspaceId', '==', currentWorkspace?.id),
      ),
    );

    const unsuscribe = onSnapshot(queryUsers, (snapshot) => {
      const wsUsers: any[] = [];

      snapshot.forEach((doc) => {
        wsUsers.push({ ...doc.data() });
      });

      setWorkspaceUsers(wsUsers as IChatUser[]);
    });

    return () => {
      unsuscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (workspaceUsers.length === 0) return;

    const otherUser = workspaceUsers.find(
      (user) =>
        user.userId === openChat?.receiverId ||
        user.userId === openChat?.senderId,
    );

    if (!otherUser) return;

    setOtherUserStatus(otherUser.status);
  }, [workspaceUsers, openChat]);

  // setar o unread messages do chat para 0 enquanto o chat estiver aberto
  useEffect(() => {
    updateUserUnreadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userChat]);

  // atualizar o userChat em tempo real (p/ atualizar os previews das mensagens)
  useEffect(() => {
    const queryThisUser = query(
      usersRef,
      where('userId', '==', currentWorkspaceMember?.id),
    );

    const unsuscribe = onSnapshot(queryThisUser, (snapshot) => {
      snapshot.forEach((doc) => {
        const user = doc.data() as IChatUser;
        setUserChat(user);
      });
    });

    return () => {
      unsuscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatId === '') return;

    const chatQuery = query(chatsRef, where(documentId(), '==', chatId));

    const unsuscribe = onSnapshot(chatQuery, (snapshot) => {
      snapshot.forEach((doc) => {
        setOpenChat(doc.data() as IChat);
      });
    });

    return () => {
      unsuscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    updateUserStatus(thisUserStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thisUserStatus]);

  useEffect(() => {
    updateServiceStatus(thisServiceStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thisServiceStatus]);

  const createUser = async (
    workspaceId: string,
    user: CurrentWorkspaceMember | null,
  ) => {
    if (!user) return;

    const userDocId = `${workspaceId}_${user.id}`;
    const userDocRef = doc(usersRef, userDocId);

    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) {
      const userData: IChatUser = {
        userId: user.id,
        workspaceId: workspaceId,
        avatarUrl: user.avatarUrl,
        name: `${user.name.firstName} ${user.name.lastName}`,
        chats: [],
        status: 'Available',
      };

      setUserChat(userData);

      await setDoc(userDocRef, userData);
    } else {
      const existingUserData = userDocSnapshot.data() as IChatUser;
      setUserChat(existingUserData);
    }
  };

  const findUserAvatar = (userId: string | undefined) => {
    return workspaceMembers?.find((member) => member.id === userId)?.avatarUrl;
  };

  const findAndSetChat = async (userId: string) => {
    const chat = userChat?.chats.find(
      (chat) => chat.senderId === userId || chat.receiverId === userId,
    );

    if (chat) {
      setChatId(chat.chatId);
      setIsSearchOpen(false);

      return;
    }

    const chatId = await handleAddChat(
      currentWorkspaceMember?.id,
      currentWorkspaceMember?.name.firstName +
        ' ' +
        currentWorkspaceMember?.name.lastName,
      userId,
      workspaceMembers?.find((member) => member.id === userId)?.name.firstName +
        ' ' +
        workspaceMembers?.find((member) => member.id === userId)?.name.lastName,
      currentWorkspace?.id,
      currentWorkspaceMember?.avatarUrl,
      findUserAvatar(userId),
    );

    if (chatId) {
      setChatId(chatId);
      setIsSearchOpen(false);
    }
  };

  const goToMessage = async (chatId: string, messageId: string) => {
    setChatId(chatId);
    setIsSearchOpen(false);

    const chatDoc = doc(chatsRef, chatId);
    const chatSnapshot = await getDoc(chatDoc);

    if (!chatSnapshot.exists()) return;

    const chat = chatSnapshot.data() as IChat;

    const index = chat?.messages.findIndex(
      (message) => message.id === messageId,
    );

    if (index !== -1) setGoingToMessageIndex(index);
  };

  const updateUserUnreadMessages = async () => {
    if (!userChat || !openChat) return;

    const chatIndex = userChat.chats.findIndex(
      (chat) => chat.chatId === openChat?.chatId,
    );

    if (chatIndex === -1) return;

    if (userChat.chats[chatIndex].unreadMessages === 0) return;

    userChat.chats[chatIndex].unreadMessages = 0;

    setUserChat((prev) => {
      return {
        ...prev!,
        chats: userChat.chats,
      };
    });

    const userDocId = `${currentWorkspace?.id}_${currentWorkspaceMember?.id}`;

    const userDocRef = doc(usersRef, userDocId);

    await setDoc(userDocRef, userChat);
  };

  const updateUserStatus = async (status: 'Available' | 'Busy' | 'Away') => {
    const userDocId = `${currentWorkspace?.id}_${currentWorkspaceMember?.id}`;
    const userDocRef = doc(usersRef, userDocId);

    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) return;

    const userData = userDocSnapshot.data() as IChatUser;

    userData.status = status;

    await setDoc(userDocRef, userData);
  };

  const updateUser = async () => {
    const userDocId = `${currentWorkspace?.id}_${currentWorkspaceMember?.id}`;
    const userDocRef = doc(usersRef, userDocId);

    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) return;

    const userData = userDocSnapshot.data() as IChatUser;

    userData.avatarUrl = currentWorkspaceMember?.avatarUrl;
    userData.name = `${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`;

    await setDoc(userDocRef, userData);
  };

  const updateServiceStatus = async (
    status: 'Resolved' | 'In progress' | 'Waiting' | 'On hold' | 'Pending',
  ) => {
    const userDocId = `${currentWorkspace?.id}_${currentWorkspaceMember?.id}`;
    const userDocRef = doc(usersRef, userDocId);

    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) return;

    const userData = userDocSnapshot.data() as IChatUser;

    // userData.status = status;

    await setDoc(userDocRef, userData);
  };

  const handleAddChat = async (
    senderId?: string,
    senderName?: string,
    receiverId?: string,
    receiverName?: string,
    workspaceId?: string,
    senderAvatarUrl?: string | null,
    receiverAvatarUrl?: string | null,
  ) => {
    // 3°: adicionar um chat
    const chatId = `${senderId}_${receiverId}_${workspaceId}`;
    const chatDocRef = doc(chatsRef, chatId);
    const chatDocSnapshot = await getDoc(chatDocRef);

    const otherChatId = `${receiverId}_${senderId}_${workspaceId}`;
    const otherChatDocRef = doc(chatsRef, otherChatId);
    const otherChatDocSnapshot = await getDoc(otherChatDocRef);

    if (chatDocSnapshot.exists() || otherChatDocSnapshot.exists()) return;

    const chat = {
      chatId,
      workspaceId: workspaceId,
      senderId,
      senderName,
      receiverId,
      receiverName,
      senderAvatarUrl: senderAvatarUrl,
      receiverAvatarUrl: receiverAvatarUrl,
      messages: [],
    } as IChat;

    await setDoc(chatDocRef, chat);

    const queryThisUser = query(usersRef, where('userId', '==', senderId));

    const snapshot = await getDocs(queryThisUser);

    snapshot.forEach(async (doc) => {
      const user = doc.data() as IChatUser;

      if (user.chats.find((chat) => chat.chatId === chatId)) return;

      const newChat = {
        chatId,
        lastMessagePreview: '',
        lastMessageDate: new Date() as unknown as TDateFirestore,
        lastMessageSenderName: '',
        senderId,
        receiverId,
        senderName,
        receiverName,
        receiverAvatarUrl,
        senderAvatarUrl,
        unreadMessages: 0,
      };

      user.chats.push(newChat);

      await setDoc(doc.ref, user);
    });

    const queryOtherUser = query(usersRef, where('userId', '==', receiverId));

    const otherUserSnapshot = await getDocs(queryOtherUser);

    otherUserSnapshot.forEach(async (doc) => {
      const user = doc.data() as IChatUser;

      if (user.chats.find((chat) => chat.chatId === chatId)) return;

      const newChat = {
        chatId,
        lastMessagePreview: '',
        lastMessageDate: new Date() as unknown as TDateFirestore,
        lastMessageSenderName: '',
        senderId,
        receiverId,
        senderName,
        receiverName,
        receiverAvatarUrl,
        senderAvatarUrl,
        unreadMessages: 0,
      };

      user.chats.push(newChat);

      await setDoc(doc.ref, user);
    });

    return chatId;
  };

  const handleSendMessage = async (
    chatId?: string,
    type?: 'img' | 'doc' | 'audio' | 'video' | undefined,
    url?: string,
    fileName?: string,
  ) => {
    if (!chatId || !openChat) return;

    // Message Sending
    const chatDocRef = doc(chatsRef, chatId);
    const chatDocSnapshot = await getDoc(chatDocRef);

    if (!chatDocSnapshot.exists()) return;

    const chat = chatDocSnapshot.data() as IChat;

    const isFile =
      type === 'doc' || type === 'img' || type === 'audio' || type === 'video';

    const message = {
      id: v4(),
      type: isFile
        ? type
        : ('text' as 'img' | 'doc' | 'audio' | 'video' | 'text'),
      text: isFile ? url : newMessage,
      fileName: isFile ? fileName : '',
      createdAt: new Date() as unknown as TDateFirestore,
      senderId: currentWorkspaceMember?.id,
      senderAvatarUrl: currentWorkspaceMember?.avatarUrl,
      senderName: `${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`,
    };

    setNewMessage('');

    chat.messages.push(message);

    await setDoc(chatDocRef, chat);

    // Updating last message preview and date for both users
    const userIds = [chat.senderId, chat.receiverId];

    const queryUsers = query(usersRef, where('userId', 'in', userIds));

    const userSnapshots = await getDocs(queryUsers);

    const updateUserChats = userSnapshots.docs.map(async (doc) => {
      const user = doc.data() as IChatUser;

      const chatIndex = user.chats.findIndex((chat) => chat.chatId === chatId);

      if (chatIndex !== -1) {
        user.chats[chatIndex].lastMessagePreview = message.text;
        user.chats[chatIndex].lastMessageDate = message.createdAt;
        user.chats[chatIndex].lastMessageSenderName = message.senderName;
        user.userId !== currentWorkspaceMember?.id &&
          user.chats[chatIndex].unreadMessages++;

        await setDoc(doc.ref, user);
      }
    });

    await Promise.all(updateUserChats);

    const otherUserId = userIds.find((id) => id !== currentWorkspaceMember?.id);

    // await sendChatNotification(
    //   otherUserId ?? '',
    //   `${currentWorkspaceMember?.name.firstName}: ${message.text!}`,
    // );
  };

  const handleSearch = async (searchQuery: string) => {
    const users: IChatUser[] = [];
    const messages: Message[] = [];

    const usersQuery = query(
      usersRef,
      where('userId', '!=', currentWorkspaceMember?.id),
      where('workspaceId', '==', currentWorkspace?.id),
    );

    const messagesQuery = query(
      chatsRef,
      where('workspaceId', '==', currentWorkspace?.id),
    );

    const usersSnapshot = await getDocs(usersQuery);
    const messagesSnapshot = await getDocs(messagesQuery);

    usersSnapshot.forEach((doc) => {
      const user = doc.data() as IChatUser;

      if (user.name.includes(searchQuery)) {
        users.push(user);
      }
    });

    messagesSnapshot.forEach((doc) => {
      const chat = doc.data() as IChat;

      chat.messages.forEach((message) => {
        if (
          message.text?.includes(searchQuery) &&
          !message.text.startsWith('http')
        ) {
          messages.push({ ...message, chatId: chat.chatId });
        }
      });
    });

    setQueryResult({ users, messages });
  };

  const sortChats = () => {
    const orderedChats = userChat?.chats.sort((a, b) => {
      return (
        new Date(b.lastMessageDate.toDate()).getTime() -
        new Date(a.lastMessageDate.toDate()).getTime()
      );
    });

    setUserChat((prev) => {
      return {
        ...prev!,
        chats: orderedChats!,
      };
    });
  };

  const formatDate = (date: TDateFirestore) => {
    const parsedDate = new Date(date.toDate());

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

  const uploadFile = async (
    file: File,
    type: 'img' | 'doc' | 'audio' | 'video',
  ) => {
    if (!file) return;

    let fileType: MessageType;

    switch (type) {
      case 'img':
        fileType = MessageType.IMAGE;
        break;
      case 'doc':
        fileType = MessageType.DOCUMENT;
        break;
      case 'video':
        fileType = MessageType.VIDEO;
        break;
      default:
        fileType = MessageType.AUDIO;
    }

    try {
      const url = await uploadFileToBucket({
        file,
        type: fileType,
        isInternal: true,
      });

      handleSendMessage(chatId, type, url, file.name);
    } catch (error) {
      enqueueSnackBar('Error uploading file', {
        variant: SnackBarVariant.Warning,
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        openChat,
        setOpenChat,
        userChat,
        setUserChat,
        createUser,
        usersRef,
        chatsRef,
        setWorkspaceUsers,
        workspaceUsers,
        handleAddChat,
        setChatId,
        chatId,
        handleSendMessage,
        setNewMessage,
        newMessage,
        isNewChatOpen,
        setIsNewChatOpen,
        otherUserStatus,
        formatDate,
        isStatusOpen,
        setIsStatusOpen,
        thisUserStatus,
        setThisUserStatus,
        isServiceStatusOpen,
        setIsServiceStatusOpen,
        thisServiceStatus,
        setThisServiceStatus,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        handleSearch,
        queryResult,
        sortChats,
        isAnexOpen,
        setIsAnexOpen,
        imageUpload,
        setImageUpload,
        fileUpload,
        setFileUpload,
        uploadFile,
        isSearching,
        setIsSearching,
        findUserAvatar,
        findAndSetChat,
        goToMessage,
        goingToMessageIndex,
        setGoingToMessageIndex,
        isDetailsOpen,
        setIsDetailsOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
