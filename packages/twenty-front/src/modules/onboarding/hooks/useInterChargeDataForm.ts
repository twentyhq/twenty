/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';
import {
  BillingPaymentProviders,
  InterCustomerType,
  InterCustomerUf,
} from '~/generated/graphql';

const interChargeDataInputSchema = z
  .object({
    cpfCnpj: z
      .string()
      .min(14, 'CPF must be 11 characters')
      .max(18, 'CNPJ must be 14 characters'),
    legalEntity: z.nativeEnum(InterCustomerType),
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(100),
    city: z.string().min(1).max(60),
    stateUnity: z.nativeEnum(InterCustomerUf),
    cep: z.string().length(10, 'CEP must be 8 characters'),
  })
  .required();

export type InterCharteDataForm = z.infer<typeof interChargeDataInputSchema>;
export const useInterChargeDataForm = () => {
  const billingCheckoutSession = useRecoilValue(billingCheckoutSessionState);

  const form = useForm<InterCharteDataForm>({
    mode: 'onSubmit',
    defaultValues: {
      cpfCnpj: '',
      legalEntity: InterCustomerType.FISICA,
      name: '',
      address: '',
      city: '',
      cep: '',
      stateUnity: InterCustomerUf.SP,
    },
    resolver: zodResolver(interChargeDataInputSchema),
  });

  const { reset, setValue, watch } = form;

  const { legalEntity, cep } = watch();

  useEffect(() => {
    setValue('cpfCnpj', '');
  }, [setValue, legalEntity]);

  useEffect(() => {
    if (
      billingCheckoutSession.paymentProvider === BillingPaymentProviders.Stripe
    ) {
      reset();
    }
  }, [billingCheckoutSession.paymentProvider, legalEntity, reset]);

  useEffect(() => {
    const fetchAddressFromCep = async (cep: string) => {
      const cleanedCep = cep.replace(/\D/g, '');

      if (cleanedCep.length !== 8) return;

      // TODO: Transfer api url to .env
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanedCep}/json/`,
        );
        const data = await response.json();

        if (data.erro) return;

        setValue('address', data.logradouro || '');
        setValue('city', data.localidade || '');
        setValue('stateUnity', data.uf || '');
      } catch (error) {
        console.error('Postcode not found: ', error);
      }
    };

    if (cep) {
      fetchAddressFromCep(cep);
    }
  }, [cep, setValue]);

  return { form };
};
