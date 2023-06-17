import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMockData } from '@/auth/hooks/useMockData';
import { hasAccessToken } from '@/auth/services/AuthService';
import { Modal } from '@/ui/components/modal/Modal';

import { Companies } from '../companies/Companies';

export function Index() {
  const navigate = useNavigate();
  useMockData();

  useEffect(() => {
    if (hasAccessToken()) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <>
      <Companies />
      <Modal>Welcome to Twenty</Modal>
    </>
  );
}
