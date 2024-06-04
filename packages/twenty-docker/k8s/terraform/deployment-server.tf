resource "kubernetes_deployment" "twentycrm_server" {
  metadata {
    name      = "${local.twentycrm_app_name}-server"
    namespace = kubernetes_namespace.twentycrm.metadata.0.name
    labels = {
      app = "${local.twentycrm_app_name}-server"
    }
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "${local.twentycrm_app_name}-server"
      }
    }

    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = "1"
        max_unavailable = "1"
      }
    }

    template {
      metadata {
        labels = {
          app = "${local.twentycrm_app_name}-server"
        }
      }

      spec {
        container {
          image = local.twentycrm_server_image
          name  = local.twentycrm_app_name
          stdin = true
          tty   = true

          security_context {
            allow_privilege_escalation = true
            privileged                 = true
            run_as_user                = 1000
          }

          env {
            name  = "PORT"
            value = "3000"
          }
          env {
            name  = "DEBUG_MODE"
            value = false
          }

          env {
            name  = "SERVER_URL"
            value = "https://crm.example.com:443"
          }

          env {
            name  = "FRONT_BASE_URL"
            value = "https://crm.example.com:443"
          }

          env {
            name  = "BACKEND_SERVER_URL"
            value = "https://crm.example.com:443"
          }

          env {
            name  = "PG_DATABASE_URL"
            value = "postgres://twenty:twenty@twentycrm-db.twentycrm.svc.cluster.local/default"
          }

          env {
            name  = "ENABLE_DB_MIGRATIONS"
            value = "true"
          }

          env {
            name  = "SIGN_IN_PREFILLED"
            value = "true"
          }

          env {
            name  = "STORAGE_TYPE"
            value = "local"
          }

          env {
            name = "ACCESS_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "accessToken"
              }
            }
          }

          env {
            name = "LOGIN_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "loginToken"
              }
            }
          }

          env {
            name = "REFRESH_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "refreshToken"
              }
            }
          }

          env {
            name = "FILE_TOKEN_SECRET"
            value_from {
              secret_key_ref {
                name = "tokens"
                key  = "fileToken"
              }
            }
          }

          port {
            container_port = 3000
            protocol       = "TCP"
          }

          resources {
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "1000m"
              memory = "1024Mi"
            }
          }

          volume_mount {
            name       = "nfs-twentycrm-server-data"
            mount_path = "/app/.local-storage"
          }
        }

        volume {
          name = "nfs-twentycrm-server-data"

          persistent_volume_claim {
            claim_name = "nfs-twentycrm-server-data-pvc"
          }
        }

        dns_policy     = "ClusterFirst"
        restart_policy = "Always"
      }
    }
  }
  depends_on = [
    kubernetes_deployment.twentycrm_db,
    kubernetes_secret.twentycrm_tokens
  ]
}
