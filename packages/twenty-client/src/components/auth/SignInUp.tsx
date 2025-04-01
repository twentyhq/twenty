import React from 'react';
import { SignInUpWithGitHub } from './SignInUpWithGitHub';
import { SignInUpWithGoogle } from './SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from './SignInUpWithMicrosoft';

export const SignInUp = () => {
  return (
    <div className="auth-options">
      <SignInUpWithGoogle />
      <SignInUpWithMicrosoft />
      <SignInUpWithGitHub />
    </div>
  );
};